import { StrategyBaseSimplified } from "./Strategy";
import { CandlePattern } from "../detector/CandlePattern";
// ================ 1h ================ //
export class Swing1h extends StrategyBaseSimplified{
    constructor(riskUSDT=1){
        //set timeframe, risk in fiat, reward ratio (1:3)= 3 reward ratio 
        super("1h",riskUSDT,2.0);
    }
    public getIndicatorInfo(): string {
        let index = this.getCurrentIndex();
        let indicatorInfo = super.getIndicatorInfo();
        //TODO: add other indicator info
        return indicatorInfo;
    }
    protected async calculateIndicators(): Promise<void> {
        //required by getTakeProfitAndStopLoss, override if use different method
        await super.addIndicator("atr",{"length":10});
        //register the indicators
        await super.addIndicator("ema",{"length":37});
        await super.addIndicator("ema",{"length":90});
        await super.addIndicator("psar",{"step":0.02,"max":0.03});
    }
    protected async checkEntry() {
        let current:number = this.getCurrentIndex();
        //general entry requirements for both buy and sell.
        let entryRequirements = [
            Math.abs(this.getOHLCbyIndex(current-1).close - this.getIndicator("ema",current,37)) < this.getIndicator("atr",current)*1,
            Math.abs(this.getOHLCbyIndex(current).close - this.getIndicator("ema",current,37)) < this.getIndicator("atr",current)*1
        ];
        //trade direction requirements
        let shortRequirements = [this.getIndicator("ema",current,37) < this.getIndicator("ema",current,90)];
        if(shortRequirements.every(Boolean)){
            // sell entry requirements
            let sellRequirements = [
                entryRequirements.every(Boolean),
                this.getOHLCbyIndex(current).high < this.getIndicator("psar",current-1),
                (CandlePattern.isDoji(this.getOHLCbyIndex(current-1)) || CandlePattern.isHammer(this.getOHLCbyIndex(current-1),true)) &&  CandlePattern.isLongTail(this.getOHLCbyIndex(current),true)
            ];
            if(sellRequirements.every(Boolean))
            return this.generateSignal(true,"sell"); // make a sell signal
        }else{
            // buy entry requirements
            let buyRequirements = [
                entryRequirements.every(Boolean),
                this.getOHLCbyIndex(current).low > this.getIndicator("psar",current-1),
                (CandlePattern.isDoji(this.getOHLCbyIndex(current-1)) || CandlePattern.isHammer(this.getOHLCbyIndex(current-1),false)) &&  CandlePattern.isLongTail(this.getOHLCbyIndex(current),false)
            ];
            if(buyRequirements.every(Boolean))
            return this.generateSignal(true,"buy"); // make a buy signal
        }
        return this.generateSignal(false,"none"); //if no signal
    }
    //get take profit and stoploss
    public getTakeProfitAndStopLoss(type: string): { tp: string; sl: string; } {
        return super.getTakeProfitAndStopLoss(type,3.3) // default method ex return: {tp:20.11,sl:30.11}
    }
    public getPositionSize():string {
        return super.getPositionSize(); // default method ex return: 12.30
    }
    //not used if value <0, to close trade after specific candles.
    public exitAfterCandles(): number {
        return -150;
    }
}
// ============== end 1h ============== //