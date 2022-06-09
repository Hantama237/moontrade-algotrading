import { StrategyBaseSimplified } from "../strategy/Strategy";
import { Binance, parseData } from "../support/Binance";
import { MoonChatBot } from "../support/telegram";

export class Trade{
    static position:any;
    static balance:any;

    static async updatePosition(){
        this.position = await Binance.getPosition();
    }
    static async updateBalance(){
        this.balance = await Binance.getBalance();
    }
    static getPosition(){
        return this.position;
    }
    static getBalance(){
        return this.balance;
    }

    static async entry(type:string,strategy:any){
        //TODO: error handling
        try{
            let TPandSL = strategy.getTakeProfitAndStopLoss(type);
            let quantity = strategy.getPositionSize();
            let trade = await Binance.setPositionWithTPSL({
                type:type,
                quantity:quantity,
                slPrice:TPandSL.sl,
                tpPrice:TPandSL.tp
            });
        }catch(error:any){
            // await Binance.closeAllPosition();
            await Binance.cancelAllOrders();
            console.log(error);
        }
        return true;
    }
    static async entryLimit(entry:{entry:boolean,size:string,tp:string,sl:string,entryPrice:number,type:string,message:string}){
        try{
            let trade = await Binance.setLimitPosition(entry.type,parseFloat(entry.size),entry.entryPrice)
        }catch(error:any){
            await Binance.cancelAllOrders();
        }
    }
    static async setLimitTPSL(entry:{entry:boolean,size:string,tp:string,sl:string,entryPrice:number,type:string,message:string}){
        try{
            let orders = await Binance.setLimitTPSL({"quantity":entry.size,"slPrice":entry.sl,"tpPrice":entry.tp,"type":entry.type})
        }catch(error:any){
            await Binance.cancelAllOrders();
        }
    }

}
export class AutoTrade{
    public static orderType:string = "MARKET";

    private static allCandlesData:any = {};
    private static webSocket:any;
    public static strategy:StrategyBaseSimplified;

    private static position:boolean = false;
    private static entry:any = null;
    private static timePassed:number = 0;

    public static isStopped:boolean = false;

   

    static async checkPosition(){
        await Trade.updatePosition();
        let result = Trade.getPosition();
        this.position = result.trade;
        MoonChatBot.sendMessage("=== "+(Math.abs(result.ammount)>0?"Open":"Close")+" Position ==\nPosition Size : "+result.ammount+"\nPrice : "+result.price);
    }
    private static async runStrategy(){
        //TRADE
        if(this.position && this.entry == null){
            await this.checkPosition();
        }else{
            //LIMIT TP_SL
            if(this.entry!=null && this.entry.entry){
                this.timePassed++;
                if(this.timePassed==1){
                    await this.checkPosition();
                    if(this.position){
                        Trade.setLimitTPSL(this.entry);
                    }else{
                        this.entry = null;
                        this.timePassed = 0;
                    }
                }
            }
            //STRATEGY
            let result  = await this.strategy.updateData(this.allCandlesData);
            if(result.entry){
                MoonChatBot.sendMessage(result.message);
                if(this.orderType == "MARKET"){
                    await Trade.entry(result.type,this.strategy);
                    await this.checkPosition();
                    if(!this.position){
                        this.webSocket.close();
                        MoonChatBot.sendMessage("Position Not Detected! restarting.");
                    }
                }else{
                    this.entry = result;
                    this.timePassed = 0;
                    await Trade.entryLimit(result);
                    MoonChatBot.sendMessage("Order submitted");
                    await this.checkPosition();
                    if(this.position){
                        Trade.setLimitTPSL(result);
                    }
                }
            }else{
                MoonChatBot.sendPersonalMessage(result.message);
            }
        }
        
    }
    private static async loadCandlesData(timeframe:string){
        this.allCandlesData[timeframe] = await Binance.getFuturesCandles(timeframe);
        this.allCandlesData[timeframe].pop(); //remove last open candle
    }
    private static async streamListener(data:any){
        let parsed = parseData(data);
        if(parsed.isClosed){
            AutoTrade.allCandlesData[AutoTrade.strategy.mainTimeframe].push(parsed.data);
            //-- should update here
            for(let timeframe of AutoTrade.strategy.otherTimeframe){
                await AutoTrade.loadCandlesData(timeframe);
            }
            if(AutoTrade.allCandlesData[AutoTrade.strategy.mainTimeframe].length==550){ AutoTrade.allCandlesData[(AutoTrade.strategy.mainTimeframe)].splice(0,50); };
            await AutoTrade.runStrategy();
        }
    }
    private static async startListener(){
        try {
            this.webSocket = await Binance.subscribeFuturesCandles(this.streamListener,this.strategy.mainTimeframe);
            this.webSocket.on('close', () => {
                MoonChatBot.sendMessage("Socket Closed!");
                MoonChatBot.sendMessage("Trade stopped");
                setTimeout(() => {
                    this.start();
                }, 3000);
            });
        }catch(error:any){
            MoonChatBot.sendMessage(error.toString());
            MoonChatBot.sendMessage("Trade stopped");
        }
    }
    public static async start(){
        if(this.isStopped) return;
        await this.checkPosition();
        await this.loadCandlesData(this.strategy.mainTimeframe);
        for(let timeframe of this.strategy.otherTimeframe){
            await this.loadCandlesData(timeframe);
        }
        MoonChatBot.sendMessage("Trade started");
        await this.runStrategy();
        this.startListener();
    }

    public static terminate(){
        this.webSocket.terminate();
    }
}