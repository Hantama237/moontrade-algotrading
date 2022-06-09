import { TradeConfig } from "..";
import { StrategyBaseSimplified } from "../strategy/Strategy";
import { Binance, parseData } from "../support/Binance";
import { MoonChatBot } from "../support/telegram";
import { Trade } from "./Trade";

let orderType:string = TradeConfig.orderType;

let allCandlesData:any = {};
let webSocket:any;
let strategy:StrategyBaseSimplified = TradeConfig.strategy;

let position:boolean = false;
let entry:any = null;
let timePassed:number = 0;
let isStopped:boolean = false;

async function checkPosition(){
    try{
        await Trade.updatePosition();
        let result = Trade.getPosition();
        position = result.trade;
        let positionNotification =  "=== "+(Math.abs(result.ammount)>0?"Open":"Close")+" Position ===\n"+
                                    "Position Size : "+result.ammount+"\n"+
                                    "Entry Price   : "+result.price+"\n";
        positionNotification += position?"Current Price : "+allCandlesData[strategy.mainTimeframe][allCandlesData[strategy.mainTimeframe].length-1][4]:"";
        MoonChatBot.sendMessage(positionNotification);
    }catch(error:any){
        MoonChatBot.sendMessage("Error Occured!");
        MoonChatBot.sendMessage( JSON.stringify(error));
        console.log(error)
    }
}
async function runStrategy(){
    //TRADE
    if(position && entry == null){
        await checkPosition();
    }else{
        //LIMIT TP_SL
        if(entry!=null && entry.entry){
            timePassed++;
            if(timePassed==1){
                await checkPosition();
                if(position){
                    await Trade.setLimitTPSL(entry);
                    entry = null;
                    timePassed = 0;
                    MoonChatBot.sendMessage("TP & SL submitted!");
                }else{
                    MoonChatBot.sendMessage("Skipped, limit order not filled!");
                    await Binance.cancelAllOrders();
                    entry = null;
                    timePassed = 0;
                }
            }
        }
        //STRATEGY
        let result  = await strategy.updateData(allCandlesData);
        if(result.entry && entry == null && !position){
            MoonChatBot.sendMessage(result.message);
            if(orderType == "MARKET"){
                await Trade.entry(result.type,strategy);
                await checkPosition();
                if(!position){
                    webSocket.close();
                    MoonChatBot.sendMessage("Position Not Detected! restarting.");
                }
            }else if(!position){
                entry = result;
                timePassed = 0;
                await Trade.entryLimit(result);
                MoonChatBot.sendMessage("Order submitted");
                await checkPosition();
                if(position){
                    Trade.setLimitTPSL(result);
                    entry = null;
                    timePassed = 0;
                }
            }
        }else{
            MoonChatBot.sendPersonalMessage(result.message);
        }
    }
    
}
async function loadCandlesData(timeframe:string){
    allCandlesData[timeframe] = await Binance.getFuturesCandles(timeframe);
    allCandlesData[timeframe].pop(); //remove last open candle
}
async function streamListener(data:any){
    try{
        let parsed = parseData(data);
        if(parsed.isClosed){
            allCandlesData[strategy.mainTimeframe].push(parsed.data);
            //-- should update here
            for(let timeframe of strategy.otherTimeframe){
                await loadCandlesData(timeframe);
            }
            if(allCandlesData[strategy.mainTimeframe].length==550){ allCandlesData[(strategy.mainTimeframe)].splice(0,50); };
            await runStrategy();
        }
    }catch(error:any){
        MoonChatBot.sendMessage("Error Occured!");
        MoonChatBot.sendMessage( JSON.stringify(error));
        console.log(error)
    }
}
async function startListener(){
    try {
        webSocket = await Binance.subscribeFuturesCandles(streamListener,strategy.mainTimeframe);
        webSocket.on('close', () => {
            MoonChatBot.sendMessage("Socket Closed!");
            setTimeout(() => {
                start();
            }, 3000);
        });
    }catch(error:any){
        MoonChatBot.sendMessage( JSON.stringify(error));
        MoonChatBot.sendMessage("Trade stopped");
        console.log(error)
    }
}

async function start(){
    try{
        if(isStopped) return;
        await checkPosition();
        await loadCandlesData(strategy.mainTimeframe);
        for(let timeframe of strategy.otherTimeframe){
            await loadCandlesData(timeframe);
        }
        MoonChatBot.sendMessage("Trade started");
        await runStrategy();
        startListener();
    }catch(error:any){
        MoonChatBot.sendMessage("Error Occured!");
        MoonChatBot.sendMessage( JSON.stringify(error));
        console.log(error)
    }
}

async function terminate(){
    webSocket.terminate();
}

try{
    MoonChatBot.getBot().onText(/\/trade (.+)/, (msg:any, match:any) => {
        const chatId:string = msg.chat.id;
        const resp:string = match[1]; // the captured "whatever"
        if(match[1] == "start" && isStopped){
            isStopped = false;
            start();
            MoonChatBot.sendPersonalMessage(chatId, "Starting Trade!");
        }else if(match[1] == "stop" && !isStopped){
            isStopped = true;
            terminate();
            MoonChatBot.sendPersonalMessage(chatId, "Stopping Trade!");
        }
    });
}catch(error:any){
    MoonChatBot.sendMessage("Error Occured!");
    MoonChatBot.sendMessage( JSON.stringify(error));
    console.log(error)
}
start();

