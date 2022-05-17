import { StrategyTestIndicator } from "./strategy/Strategy";
import { Strategy5mV1, Strategy5mV2Psar } from "./strategy/Strategy5m";
import { Binance, parseData } from "./support/Binance";
import { MoonChatBot } from "./support/telegram";
import { Trade } from "./support/Trade";

let webSocket:any;
let isStopped:boolean = false;
//Strategy
let strategy = new Strategy5mV2Psar();
let position:boolean=false;
//ALL candles
let allCandlesData:any = {};
let mainTimeframe:string = strategy.mainTimeframe;
let otherTimeframe:Array<string> = strategy.otherTimeframe;

async function checkPosition(){
    await Trade.updatePosition();
    let result = Trade.getPosition();
    position = result.trade;
    MoonChatBot.sendMessage("=== "+(Math.abs(result.ammount)>0?"Open":"Close")+" Position ==\nPosition Size : "+result.ammount+"\nPrice : "+result.price);
}
async function runStrategy(){
    //TRADE
    if(position){
        await checkPosition();
    }else{
        //STRATEGY
        let result  = await strategy.updateData(allCandlesData);
        if(result.entry){
            MoonChatBot.sendMessage(result.message);
            await Trade.entry(result.type,strategy);
            await checkPosition();
            if(!position){
                webSocket.close();
                MoonChatBot.sendMessage("Position Not Detected! restarting.");
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
    let parsed = parseData(data);
    if(parsed.isClosed){
        allCandlesData[mainTimeframe].push(parsed.data);
        //-- should update here
        for(let e of otherTimeframe){
            await loadCandlesData(e);
        }
        await runStrategy();
    }
}
async function startListener(){
    try {
        webSocket = await Binance.subscribeFuturesCandles(streamListener,mainTimeframe);
        webSocket.on('close', () => {
            MoonChatBot.sendMessage("Socket Closed!");
            MoonChatBot.sendMessage("Trade stopped");
            setTimeout(() => {
                main();
            }, 3000);
        });
    }catch(error:any){
        MoonChatBot.sendMessage(error.toString());
        MoonChatBot.sendMessage("Trade stopped");
    }
}
async function main(){
    if(isStopped) return;
    //TRADE
    await checkPosition();
    //STREAM
    await loadCandlesData(mainTimeframe);
    for(let e of otherTimeframe){
        await loadCandlesData(e);
    }
    MoonChatBot.sendMessage("Trade started");
    await runStrategy();
    startListener();
}

MoonChatBot.getBot().onText(/\/trade (.+)/, (msg:any, match:any) => {
    const chatId:string = msg.chat.id;
    const resp:string = match[1]; // the captured "whatever"
    if(match[1] == "start" && isStopped){
        isStopped = false;
        main();
        MoonChatBot.sendPersonalMessage(chatId, "Starting Trade!");
    }else if(match[1] == "stop" && !isStopped){
        isStopped = true;
        webSocket.terminate();
        MoonChatBot.sendPersonalMessage(chatId, "Stopping Trade!");
    }
});
main();

