import { Backtest, BacktestTool } from "./Backtest";
import { Strategy, MyFirstStrategy, Strategy1h, Strategy5m, Strategy1hTrendFolowerEMA, StrategyEngulfing, StrategyTestIndicator } from "../strategy/Strategy";

let strategy = new Strategy1hTrendFolowerEMA();//new Strategy();

let allCandlesData:Array<Array<string>>=new Array<Array<string>>();
let currentCandlesData:any={};

let signals:Array<any> = [];
//---
let tax:number = 0.0004;
//taker 0.04% 
let balance:number =1000;
let profitInFiat:number = 0;
let profitInPercent:number = 0;
//--
let position:boolean=false;
let positionSize:number = 0;
let entryPrice:number = 0;
let winPrecentage:number = 0;
let losePrecentage:number = 0;
let totalPositionSize:number = 0;

let maxDrawdown:number = 0;
let maxGain:number = 0;
let trackData:any = null; 

let type:string; 
let winPrice:any;
let losePrice:number;
let trailingPrice:any = null;
let trailingPercentage:number;
let winCount:number=0;
let loseCount:number=0;

let loseTrack:Array<any>=[];

async function runStrategy(){
    let result  = await  strategy.updateData(currentCandlesData);
    //if(!result.entry) result = await strategy2.updateData(currentCandlesData);
    let index = currentCandlesData[strategy.mainTimeframe].length-1;
    if(result.entry && !position){
        //--
        position=true;
        positionSize = parseFloat(strategy.getPositionSize())*currentCandlesData[strategy.mainTimeframe][index][4];
        
        type=result.type;
        entryPrice = parseFloat(currentCandlesData[strategy.mainTimeframe][index][4]);
        winPrice = parseFloat(strategy.getTakeProfitAndStopLoss(result.type).tp);
        losePrice = parseFloat(strategy.getTakeProfitAndStopLoss(result.type).sl);
        trailingPrice = null;

        winPrecentage = Math.abs(winPrice-entryPrice)/entryPrice;
        losePrecentage =  Math.abs(losePrice-entryPrice)/entryPrice;

        trackData = {
            "date":new Date(parseInt(currentCandlesData[strategy.mainTimeframe][index][0])).toLocaleString(),
            "close":currentCandlesData[strategy.mainTimeframe][index][4],
            "type":result.type,
            "tp":winPrice,
            "sl":losePrice,
            "indicator":strategy.getIndicatorInfo()
        };
    }else{
        
    }
    
    if(position){
        // let trailing = strategy.checkTrailing(entryPrice,losePrice,type);
        // if(trailing.trailed){ 
        //     if(type=="sell"){
        //         if(trailing.price < trailingPrice || trailingPrice == null) trailingPrice = trailing.price; 
        //         if(trailingPrice < entryPrice && trailing.removeTP) winPrice = null;
        //     }else{
        //         if(trailing.price > trailingPrice || trailingPrice == null) trailingPrice = trailing.price; 
        //         if(trailingPrice > entryPrice && trailing.removeTP) winPrice = null;
        //     }
        //     trailingPercentage = Math.abs(trailingPrice-entryPrice)/entryPrice;
        // }
        if(type=="buy"){
            //win
            if(winPrice!=null && currentCandlesData[strategy.mainTimeframe][currentCandlesData[strategy.mainTimeframe].length-1][2] >= winPrice){
                position=false;
                profitInFiat += (winPrecentage - tax-tax+tax*winPrecentage) * positionSize;
                winCount++;
            //loss
            }else if(trailingPrice!=null && currentCandlesData[strategy.mainTimeframe][currentCandlesData[strategy.mainTimeframe].length-1][3] <= trailingPrice){
                position=false;
                if(trailingPrice >= entryPrice){
                    profitInFiat += (trailingPercentage - tax+tax-tax*trailingPercentage)* positionSize;
                    winCount++;
                }else{
                    profitInFiat -= (trailingPercentage + tax+tax-tax*trailingPercentage)* positionSize;
                    loseCount++;
                }
            }else if(currentCandlesData[strategy.mainTimeframe][currentCandlesData[strategy.mainTimeframe].length-1][3] <=losePrice){
                position=false;
                profitInFiat -= (losePrecentage + tax+tax-tax*losePrecentage)* positionSize;
                loseCount++;
                loseTrack.push(trackData)
            }
        }else{
            //win
            if(winPrice!=null && currentCandlesData[strategy.mainTimeframe][currentCandlesData[strategy.mainTimeframe].length-1][3]<=winPrice){
                position=false;
                profitInFiat += (winPrecentage - tax-tax-tax*winPrecentage) * positionSize;
                winCount++;
            //loss
            }else if(trailingPrice!=null && currentCandlesData[strategy.mainTimeframe][currentCandlesData[strategy.mainTimeframe].length-1][2] >= trailingPrice){
                position=false;
                if(trailingPrice <= entryPrice){
                    profitInFiat += (trailingPercentage - tax+tax-tax*trailingPercentage)* positionSize;
                    winCount++;
                }else{
                    profitInFiat -= (trailingPercentage + tax+tax-tax*trailingPercentage)* positionSize;
                    loseCount++;
                }
            }else if(currentCandlesData[strategy.mainTimeframe][currentCandlesData[strategy.mainTimeframe].length-1][2] >=losePrice){
                position=false;
                profitInFiat -= (losePrecentage + tax+tax-tax*losePrecentage)* positionSize;
                loseCount++;
                loseTrack.push(trackData)
            }
        }
        maxDrawdown = maxDrawdown<profitInFiat?maxDrawdown:profitInFiat;
        maxGain = maxGain>profitInFiat?maxGain:profitInFiat;
    }
}
function loadCandlesData(timeframe:string){
    if(currentCandlesData[timeframe]==undefined) currentCandlesData[timeframe]=[];
    let length = allCandlesData.length>700?500:37; 
    for(let i=0;i<length;i++){
        currentCandlesData[timeframe].push(allCandlesData.pop());
    }
}
async function streamRunner(){
    while(allCandlesData.length>0){
        if(currentCandlesData[(strategy.mainTimeframe as string)].length==550){ currentCandlesData[(strategy.mainTimeframe as string)].splice(0,50); };
        currentCandlesData[(strategy.mainTimeframe as string)].push(allCandlesData.pop());
        await runStrategy();
        process.stdout.write("\rProfit USDT: "+profitInFiat.toFixed(2)+" "+((trackData!=null)?trackData.date:""));
        // === SET Profit Limiter
        // if(profitInFiat>(4*11)){
        //     console.log("Profit Target reached");
        //     break;
        // }
    }
}
function readHistory(symbol:string="LTCUSDT",timeframe:string,year:string,monthFrom:number,monthUntil:number){
    for(let i=monthFrom;i<=(monthUntil);i++){
        allCandlesData.push(...BacktestTool.loadHistory(symbol+"/"+year+"/"+timeframe+"/"+symbol+"-"+timeframe+"-"+year+"-"+(i<=9?"0"+i:i)));
    }
}
async function main(){
    //strategy.riskFiat = 4;
    // ==== 1h ====
    //readHistory("LTCUSDT","1h","2020",1,12);
    //readHistory("LTCUSDT","1h","2021",1,12);
    readHistory("LTCUSDT","1h","2022",1,4);
    
    // readHistory("BNBUSDT","1h","2020",2,12);
    // readHistory("BNBUSDT","1h","2021",1,12);
    // readHistory("BNBUSDT","1h","2022",1,4);
    // ==== 5m =====
    // readHistory("LTCUSDT","5m","2020",1,12);
    // readHistory("LTCUSDT","5m","2021",4,12);
    // readHistory("LTCUSDT","5m","2022",1,4);
    // ==== 15m =====
    // readHistory("LTCUSDT","15m","2021",1,12);
    // readHistory("LTCUSDT","15m","2022",1,4);
    // =============

    winCount=0;
    loseCount=0;
    allCandlesData.reverse();
    console.log(allCandlesData.length);
    loadCandlesData(strategy.mainTimeframe);
    await runStrategy();
    await streamRunner();

    //=== PRINT RESULT ===//
    // console.info(loseTrack);
    console.log("Win: "+winCount+", Lost: "+loseCount);
    console.log("Profit USDT: "+profitInFiat);
    console.log("Max Drawdown: "+maxDrawdown+", Max Gain: "+maxGain);
}
//TODO: paramter optimization, trailing stop
// main();
let backtest = new Backtest(new Strategy1hTrendFolowerEMA(),
    {
        "yearsToLoad":["2022"],
        "monthToLoad":{"from":1,"until":4},
        "symbolToLoad":"LTCUSDT",
        "timeframeToLoad":"1h"
    });

backtest.start();