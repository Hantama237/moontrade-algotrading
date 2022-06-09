import { Tulind } from "../support/Tulind";
import { separateOHLCtoIndividualArray } from "../support/Binance";
import { CandlePattern } from "../detector/CandlePattern";


class StrategyBase{
    public mainTimeframe:string;
    public otherTimeframe:Array<string>;

    protected CandlesData:any = {};
    protected OHLCsData:any = {};
    protected IndicatorsData:any = {};
    protected riskFiat = NaN;
    protected rewardRatio = NaN;

    constructor(mainTimeframe:string,otherTimeframe:Array<string>){
        this.mainTimeframe = mainTimeframe;
        this.otherTimeframe = otherTimeframe;
    }
    protected getOHLCbyIndex(index:number){
        let currentCandle = {
            "open":this.OHLCsData[this.mainTimeframe].open[index],
            "high":this.OHLCsData[this.mainTimeframe].high[index],
            "low":this.OHLCsData[this.mainTimeframe].low[index],
            "close":this.OHLCsData[this.mainTimeframe].close[index],
        };
        return currentCandle;
    }
    private storeOHLC(){
        this.OHLCsData[this.mainTimeframe] = separateOHLCtoIndividualArray(this.CandlesData[this.mainTimeframe]);
        this.otherTimeframe.forEach(e => {
            this.OHLCsData[e] = separateOHLCtoIndividualArray(this.CandlesData[e]);
        });
    }
    protected initiateIndicatorsObject(timeframe:string,indicator:string){
        if(this.IndicatorsData[timeframe] == undefined) this.IndicatorsData[timeframe] = {};
        if(this.IndicatorsData[timeframe][indicator] == undefined) this.IndicatorsData[timeframe][indicator] = {};
    }
    public async updateData(CandlesData:any):Promise<any>{
        this.CandlesData=CandlesData;
        this.storeOHLC();
    }
    public checkTrailing(entryPrice:number,losePrice:number,type:string){
        return {
            "trailed":false,
            "price":0,
            "removeTP":false
        };
    }
    public getIndicatorInfo(){}
    protected getCurrentIndex(){
        return this.CandlesData[this.mainTimeframe].length-1;
    }
    public getTakeProfitAndStopLoss(type:string,atrMultiplier:number=3){
        let index = this.CandlesData[this.mainTimeframe].length-1;
        let atr = this.IndicatorsData[this.mainTimeframe]["atr"][index];
        let currentPrice = this.OHLCsData[this.mainTimeframe].close[index];
        let slPrice:number = Math.abs((atr * atrMultiplier) + (type=="sell"?currentPrice:0)-((type=="buy"?currentPrice:0)));
        let tpPrice:number = Math.abs((atr * atrMultiplier * this.rewardRatio) + (type=="buy"?currentPrice:0)-((type=="sell"?currentPrice:0)));
        return {
            "tp":tpPrice.toFixed(2),
            "sl":slPrice.toFixed(2)
        };
    }
    public getPositionSize(){
        let index = this.CandlesData[this.mainTimeframe].length-1;
        let currentPrice = this.OHLCsData[this.mainTimeframe].close[index];
        let positionSize:number = (this.riskFiat/Math.abs(parseFloat(this.getTakeProfitAndStopLoss("buy").sl) - parseFloat(currentPrice)) * currentPrice)/currentPrice;
        return positionSize.toFixed(2);
    }

    public generateSignal(entry:boolean,type:string):{entry:boolean,size:string,tp:string,sl:string,entryPrice:number,type:string,message:string}{
        let entryPrice = this.getOHLCbyIndex(this.getCurrentIndex()).close;
        let positionSize = this.getPositionSize();
        let TPSL = this.getTakeProfitAndStopLoss(type)
        if(entry)
        return {
            "entry":entry,
            "entryPrice":entryPrice,
            "type":type,
            "size":positionSize,
            "tp":TPSL.tp,
            "sl":TPSL.sl,

            "message":
                "======= "+(type=="sell"?"SELL":"BUY")+" =======\n"
                +this.getIndicatorInfo()+"\n"+
                "size:"+positionSize+"\n"+
                "tp:"+TPSL.tp+"\n"+
                "sl:"+TPSL.sl+"\n"+
                "Entry "+type+" potential, pattern detected"
        };
        else
        return {
            "entry":entry,
            "entryPrice":this.getOHLCbyIndex(this.getCurrentIndex()).close,
            "type":type,
            "size":positionSize,
            "tp":TPSL.tp,
            "sl":TPSL.sl,
            "message":
            this.getIndicatorInfo()+
            "No entry potential"
        };
    }
    public exitAfterCandles(){
        return -1;
    }

    
}
export class StrategyBaseSimplified extends StrategyBase{
    

    constructor(timeframe="1h",riskFiat:number,rewardRatio:number){
        super(timeframe,[]);
        this.riskFiat = riskFiat;
        this.rewardRatio = rewardRatio;
    } 
    public async updateData(CandlesData:any):Promise<any>{
        super.updateData(CandlesData);
        await this.calculateIndicators();
        return this.checkEntry();
    }
    protected async calculateIndicators(){}
    public getIndicatorInfo(){
        let index = this.getCurrentIndex();
        let indicatorInfo = 
        "CLOSE : "+this.OHLCsData[this.mainTimeframe].close[index]+"\n";
        return indicatorInfo;
    }

    protected checkEntry(){}


    protected async addIndicator(name:string,options:any){
        switch (name) {
            case "ema":
                //options: length
                this.initiateIndicatorsObject(this.mainTimeframe,"ema");
                this.IndicatorsData[this.mainTimeframe]["ema"][options.length] = await Tulind.getEMA(options.length,this.OHLCsData[this.mainTimeframe].close);
                break;
            case "emaold":
                //options: length
                this.initiateIndicatorsObject(this.mainTimeframe,"ema");
                this.IndicatorsData[this.mainTimeframe]["ema"][options.length] = await Tulind.getEMAOld(options.length,this.OHLCsData[this.mainTimeframe].close);
                break;
            case "atr":
                //options: length
                this.initiateIndicatorsObject(this.mainTimeframe,"atr");
                this.IndicatorsData[this.mainTimeframe]["atr"] = await Tulind.getATROld(options.length,this.OHLCsData[this.mainTimeframe].high,this.OHLCsData[this.mainTimeframe].low,this.OHLCsData[this.mainTimeframe].close);
                break;
            case "atrnew":
                //options: length
                this.initiateIndicatorsObject(this.mainTimeframe,"atr");
                this.IndicatorsData[this.mainTimeframe]["atr"] = await Tulind.getATR(options.length,this.OHLCsData[this.mainTimeframe].high,this.OHLCsData[this.mainTimeframe].low,this.OHLCsData[this.mainTimeframe].close);
            case "psar":
                //options: step,max 
                this.initiateIndicatorsObject(this.mainTimeframe,"psar");
                this.IndicatorsData[this.mainTimeframe]["psar"] = await Tulind.getPSAROld(this.OHLCsData[this.mainTimeframe].high,this.OHLCsData[this.mainTimeframe].low,options.step,options.max);//max 0.03 default 0.2
                break;
            case "psarnew":
                this.initiateIndicatorsObject(this.mainTimeframe,"psar");
                this.IndicatorsData[this.mainTimeframe]["psar"] = await Tulind.getPSAR(this.OHLCsData[this.mainTimeframe].high,this.OHLCsData[this.mainTimeframe].low,options.step,options.max);//max 0.03 default 0.2
                break;
            case "rsi":
                //options: length
                this.initiateIndicatorsObject(this.mainTimeframe,"rsi");
                this.IndicatorsData[this.mainTimeframe]["rsi"] = await Tulind.getRSI(options.length,this.OHLCsData[this.mainTimeframe].close);//max 0.03 default 0.2
                break;
            case "macd":
                //options: short, long, signal
                this.initiateIndicatorsObject(this.mainTimeframe,"macd");
                this.IndicatorsData[this.mainTimeframe]["macd"] = await Tulind.getMACD(options.short,options.long,options.signal,this.OHLCsData[this.mainTimeframe].close);
            case "kc":
                //options: length, multiplier
                this.initiateIndicatorsObject(this.mainTimeframe,"kc");
                this.IndicatorsData[this.mainTimeframe]["kc"] = await Tulind.getKC(options.length,options.multiplier,this.OHLCsData[this.mainTimeframe].high,this.OHLCsData[this.mainTimeframe].close,this.OHLCsData[this.mainTimeframe].low);
            case "dc":
                //options: length, percentage
                this.initiateIndicatorsObject(this.mainTimeframe,"dc");
                this.IndicatorsData[this.mainTimeframe]["dc"] = await Tulind.getDC(options.length,options.percentage,this.OHLCsData[this.mainTimeframe].close);
            case "chandelierexit":
                //options: length, multiplier
                this.initiateIndicatorsObject(this.mainTimeframe,"chandelierexit");
                this.IndicatorsData[this.mainTimeframe]["chandelierexit"] = await Tulind.getChandelierExit(options.length,options.multiplier,this.OHLCsData[this.mainTimeframe].high,this.OHLCsData[this.mainTimeframe].close,this.OHLCsData[this.mainTimeframe].low);
            case "adx":
                //options: length
                this.initiateIndicatorsObject(this.mainTimeframe,"adx");
                this.IndicatorsData[this.mainTimeframe]["adx"] = await Tulind.getADX(options.length,this.OHLCsData[this.mainTimeframe].high,this.OHLCsData[this.mainTimeframe].low,this.OHLCsData[this.mainTimeframe].close);
            default:
                break;
        }
    }
    protected getIndicator(name:string,index:number,length:number=NaN){
        if(!isNaN(length)) 
            return this.IndicatorsData[this.mainTimeframe][name][length][index];
        else 
            return this.IndicatorsData[this.mainTimeframe][name][index];
    }

}
//==== TEMPLATE ====//
export class StrategyTemplate extends StrategyBase{
    constructor(){
        super("5m",[]);
    } 
    //called each time candles update
    public async updateData(CandlesData:any){
        super.updateData(CandlesData);
        await this.calculateIndicators();
        return this.checkEntry();
    }
    //define the indicators
    private async calculateIndicators(){
        //KC 37 3, EMA 50 & 200, ATR: break KC, KC mid < 2*ATR, trend direction EMA, sl KC mid/ATR*3, 1:2 RR
        this.initiateIndicatorsObject(this.mainTimeframe,"atr");
        this.IndicatorsData[this.mainTimeframe]["atr"][14] = await Tulind.getATR(14,this.OHLCsData[this.mainTimeframe].high,this.OHLCsData[this.mainTimeframe].low,this.OHLCsData[this.mainTimeframe].close);
        
        for(let e in this.otherTimeframe){
           //additional timeframe
        };
    } 
    //indicator info to be printed  
    public getIndicatorInfo(){
        super.getIndicatorInfo();
        let index = this.CandlesData[this.mainTimeframe].length-1;
        let indicatorInfo = 
        "CLOSE : "+this.OHLCsData[this.mainTimeframe].close[index]+"\n"+
        "ATR: "+this.IndicatorsData[this.mainTimeframe]["atr"][14][index];
        return indicatorInfo;
    }
    
    private checkEntry(){
        let index = this.CandlesData[this.mainTimeframe].length-1;
        let bbandsIndex = this.IndicatorsData[this.mainTimeframe]["bbands"][1].length-1;
        let prevCandle = this.getOHLCbyIndex(index-1);
        let currentCandle = this.getOHLCbyIndex(index);
        //=== general entry prequirements
        let entryRequirement = true;
        //Decide Short or Long
        let shortRequirement = this.IndicatorsData[this.mainTimeframe]["ema"][37][index]<this.IndicatorsData[this.mainTimeframe]['ema'][90][index];
        if(shortRequirement){
            //check for short signal
            let sellRequirement = CandlePattern.isBearish(currentCandle) && (CandlePattern.isDoji(prevCandle));
            if(entryRequirement && sellRequirement)
            return this.generateSignal(true,"sell")
        }else{
            //check for long signal
            let buyRequirement = CandlePattern.isBullish(currentCandle)  && (CandlePattern.isDoji(prevCandle));
            if(entryRequirement && buyRequirement)
            return this.generateSignal(true,"buy")
        }
        return this.generateSignal(false,"none")
    }
    
    // ================================= TRADE FUNCTION =============================== //
    //to get stoploss and take profit
    private slATRMultiplier = 1; 
    private tpATRMultiplier = 2; 
    public getTakeProfitAndStopLoss(type:string="buy"){
        let index = this.CandlesData[this.mainTimeframe].length-1;
        let atr = this.IndicatorsData[this.mainTimeframe]["atr"][14][index];
        let currentPrice = this.OHLCsData[this.mainTimeframe].close[index];
        let slPrice:number = Math.abs((atr * this.slATRMultiplier) + (type=="sell"?currentPrice:0)-((type=="buy"?currentPrice:0)));
        let tpPrice:number = Math.abs((atr * this.tpATRMultiplier) + (type=="buy"?currentPrice:0)-((type=="sell"?currentPrice:0)));
        return {
            "tp":tpPrice.toFixed(2),
            "sl":slPrice.toFixed(2)
        };
    }
    //to get position size
    private riskUSDT = 1;
    public getPositionSize(){
        let index = this.CandlesData[this.mainTimeframe].length-1;
        let currentPrice = this.OHLCsData[this.mainTimeframe].close[index];
        let TPSL = this.getTakeProfitAndStopLoss();
        let positionSize:number = (this.riskUSDT/Math.abs(parseFloat(TPSL.sl) - parseFloat(currentPrice)) * currentPrice)/currentPrice;
        return positionSize.toFixed(2).toString();
    }
    //#OPTIONAL trend follower only
    public updateTrailingStop(){
        //TODO: generate trailing stop
    }
}
export class StrategySimplifiedTemplate extends StrategyBaseSimplified{
    constructor(){
        //set timeframe, risk in fiat, reward ratio (1:3)= 3 reward ratio 
        super("1h",1,1.33);
    }
    public getIndicatorInfo(): string {
        let index = this.getCurrentIndex();
        let indicatorInfo = super.getIndicatorInfo();
        //TODO: add other indicator info
        return indicatorInfo;
    }
    protected async calculateIndicators(): Promise<void> {
        //required by getTakeProfitAndStopLoss, override if use different method
        await super.addIndicator("atr",{"length":14});
        //register the indicators
        await super.addIndicator("ema",{"length":37});
        await super.addIndicator("ema",{"length":90});
    }
    protected async checkEntry() {
        let current:number = this.getCurrentIndex();
        //general entry requirements for both buy and sell.
        let entryRequirements = [];
        //trade direction requirements
        let shortRequirements = [this.getIndicator("ema",current,37) < this.getIndicator("ema",current,90)];
        if(shortRequirements.every(Boolean)){
            // sell entry requirements
            let sellRequirements = [
                CandlePattern.isEngulfing(this.getOHLCbyIndex(current-1),this.getOHLCbyIndex(current),true),
            ];
            if(sellRequirements.every(Boolean))
            return this.generateSignal(true,"sell"); // make a sell signal
        }else{
            // buy entry requirements
            let buyRequirements = [
                CandlePattern.isEngulfing(this.getOHLCbyIndex(current-1),this.getOHLCbyIndex(current)),
            ];
            if(buyRequirements.every(Boolean))
            return this.generateSignal(true,"buy"); // make a buy signal
        }
        return this.generateSignal(false,"none"); //if no signal
    }
    //get take profit and stoploss
    public getTakeProfitAndStopLoss(type: string): { tp: string; sl: string; } {
        return super.getTakeProfitAndStopLoss(type,3) // default method ex: {tp:20.11,sl:30.11}
    }
    public getPositionSize():string {
        return super.getPositionSize(); // default method ex: 12.30
    }
}
//==== TEST INDICATOR ====//
export class StrategyTestIndicator extends StrategyBaseSimplified{
    constructor(){
        //set timeframe, risk in fiat, reward ratio (1:3)= 3 reward ratio 
        super("5m",0.02,1.33);
    }
    public getIndicatorInfo(): string {
        let index = this.getCurrentIndex();
        let indicatorInfo = super.getIndicatorInfo();
        indicatorInfo += "CExit : "+this.getIndicator("chandelierexit",0)[index]+", "+this.getIndicator("chandelierexit",1)[index]+", "+this.getIndicator("chandelierexit",2)[index]+"\n";
        indicatorInfo += "ATR : "+this.getIndicator("atr",index)+"\n";
        return indicatorInfo;
    }
    protected async calculateIndicators(): Promise<void> {
        //required by getTakeProfitAndStopLoss, override if use different method
        await super.addIndicator("atr",{"length":14});
        //register the indicators
        await super.addIndicator("ema",{"length":37});
        await super.addIndicator("ema",{"length":90});
        await super.addIndicator("chandelierexit",{"length":1,"multiplier":2});
    }
    protected async checkEntry() {
        return this.generateSignal(true,"sell");
        let index = this.getCurrentIndex();
        let entryRequirements = [
            true,
            Math.abs(this.getIndicator("ema",index,37)-this.getIndicator("ema",index,90)) > this.getIndicator("atr",index)*2
        ];
        if(this.getOHLCbyIndex(index).low > this.getIndicator("ema",index,90)){
            let buyRequirements=[
                this.getIndicator("chandelierexit",1)[index] < this.getOHLCbyIndex(index).close,
                this.getIndicator("chandelierexit",1)[index] > this.getOHLCbyIndex(index).low,
                CandlePattern.isDoji(this.getOHLCbyIndex(index-1)) && CandlePattern.isBullish(this.getOHLCbyIndex(index)) || CandlePattern.isEngulfing(this.getOHLCbyIndex(index-1),this.getOHLCbyIndex(index),false)
            ];
            if(buyRequirements.every(Boolean) && entryRequirements.every(Boolean)) return this.generateSignal(true,"buy");
        }else if(this.getOHLCbyIndex(index).high < this.getIndicator("ema",index,90)){
            let sellRequirements=[
                this.getIndicator("chandelierexit",0)[index] > this.getOHLCbyIndex(index).close,
                this.getIndicator("chandelierexit",0)[index] < this.getOHLCbyIndex(index).high,
                CandlePattern.isDoji(this.getOHLCbyIndex(index-1)) && CandlePattern.isBearish(this.getOHLCbyIndex(index)) || CandlePattern.isEngulfing(this.getOHLCbyIndex(index-1),this.getOHLCbyIndex(index),true)
            ];
            if(sellRequirements.every(Boolean) && entryRequirements.every(Boolean)) return this.generateSignal(true,"sell");
        }
        return this.generateSignal(false,"none");
    }
    //get take profit and stoploss
    public getTakeProfitAndStopLoss(type: string): { tp: string; sl: string; } {
        return super.getTakeProfitAndStopLoss(type,1) //3 is the multiplier, default method atr based, return ex: {tp:20.11,sl:30.11}
    }
    public getPositionSize():string {
        return super.getPositionSize(); // default method return ex: 12.30
    }
    public exitAfterCandles(): number {
        return 20;
    }
}




