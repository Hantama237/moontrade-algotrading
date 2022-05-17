
var fs = require('fs');

export class BacktestTool{
    static loadHistory(filename:string){
        let CandlesData:any = [];
        var data = fs.readFileSync('./backtest/historical/' + filename + '.csv')
        .toString() // convert Buffer to string
        .split('\n') // split string to lines
        .map((e:any) => e.trim()) // remove white spaces for each line
        .map((e:any) => e.split(',').map((e:any) => e.trim())); // split each line to array

        data.forEach((e:any) => {
            if (!isNaN(e[4])) {
                CandlesData.push(e);
            }
        });
        return CandlesData;
    }
    
}

export class Backtest{
    private strategy:any = null;
    // ======= DATA =======
    private allCandlesData:Array<Array<string>>=new Array<Array<string>>();
    private currentCandlesData:any={};
    private dateToLoad:Array<{year:string,month:{from:number,until:number}}>;
    private symbolToLoad = "";
    private timeframeToLoad = "";

    // ======= TRADE =======
    private tax = 0.0004;
    private position=false;
    private positionSize = 0;
    private entryPrice = 0;
    private takeProfit = 0;
    private stopLoss = 0;
    private type = "";

    private withTrailingStop = false;
    private trailingPrice = 0;
    
    private countCandle = 0;
    // ======= TRACKING ======= //
    private profitInFiat = 0;

    private maxDrawdown = 0 ;
    private maxGain = 0;
    private winCount = 0;
    private loseCount = 0;

    private currentLogData:any = null;
    private loseLog:any = [];
    
    public constructor(strategy:any,loadOptions:
            {
                dateToLoad:Array<{year:string,month:{from:number,until:number}}>,
                symbolToLoad:string,timeframeToLoad:string
            }
    ){
        this.strategy = strategy;
        this.dateToLoad = loadOptions.dateToLoad;
        this.symbolToLoad = loadOptions.symbolToLoad;
        this.timeframeToLoad = loadOptions.timeframeToLoad;
    }
    private readHistory(symbol:string="LTCUSDT",timeframe:string,year:string,monthFrom:number,monthUntil:number){
        for(let i=monthFrom;i<=(monthUntil);i++){
            this.allCandlesData.push(...BacktestTool.loadHistory(symbol+"/"+year+"/"+timeframe+"/"+symbol+"-"+timeframe+"-"+year+"-"+(i<=9?"0"+i:i)));
        }
    }
    private loadCandlesData(timeframe:string){
        if(this.currentCandlesData[timeframe]==undefined) this.currentCandlesData[timeframe]=[];
        let length = this.allCandlesData.length>700?500:37; 
        for(let i=0;i<length;i++){
            this.currentCandlesData[timeframe].push(this.allCandlesData.pop());
        }
    }
    private async runStrategy(){
        let result  = await  this.strategy.updateData(this.currentCandlesData);
        let index = this.currentCandlesData[this.strategy.mainTimeframe].length-1;
        if(result.entry && !this.position){
            this.countCandle = 0;
            this.position = true;
            this.type = result.type;
            this.positionSize = parseFloat(this.strategy.getPositionSize())*this.currentCandlesData[this.strategy.mainTimeframe][index][4];
            this.entryPrice = parseFloat(this.currentCandlesData[this.strategy.mainTimeframe][index][4]);
            this.takeProfit = parseFloat(this.strategy.getTakeProfitAndStopLoss(result.type).tp);
            this.stopLoss = parseFloat(this.strategy.getTakeProfitAndStopLoss(result.type).sl);
            this.currentLogData = {
                "date":new Date(parseInt(this.currentCandlesData[this.strategy.mainTimeframe][index][0])).toLocaleString(),
                "close":this.currentCandlesData[this.strategy.mainTimeframe][index][4],
                "type":result.type,
                "tp":this.takeProfit,
                "sl":this.stopLoss,
                "indicator":this.strategy.getIndicatorInfo()
            };
        }
        if(this.position){
            let index = this.currentCandlesData[this.strategy.mainTimeframe].length-1;
            //time check
            this.countCandle++;
            let exitAfter = this.strategy.exitAfterCandles();
            if(exitAfter>0 && this.countCandle>exitAfter){
                this.stopLoss = this.currentCandlesData[this.strategy.mainTimeframe][index][4];
            }
            //trailing check
            let trailing = this.strategy.checkTrailing(this.entryPrice,this.stopLoss,this.type);
            if(trailing.trailed){ 
                if(this.type=="buy"){
                    this.stopLoss = trailing.price > this.stopLoss?trailing.price:this.stopLoss;
                }else{
                    this.stopLoss = trailing.price < this.stopLoss?trailing.price:this.stopLoss;
                }
                if(trailing.removeTP){
                    this.takeProfit = this.type=="sell"?-1000000:1000000;
                }
            }
            //price check
            let currentCandle = this.currentCandlesData[this.strategy.mainTimeframe][index];
            let winPrecentage = Math.abs(this.takeProfit-this.entryPrice)/this.entryPrice;
            if(this.type == "buy"){
                if(currentCandle[2] >= this.takeProfit){
                    this.position=false;
                    this.profitInFiat += ((winPrecentage * this.positionSize) - (this.positionSize * (this.tax+this.tax+this.tax*winPrecentage)));
                    this.winCount++;
                }else if(currentCandle[3] <= this.stopLoss){
                    this.position=false;
                    let losePrecentage = (this.stopLoss-this.entryPrice)/this.entryPrice;
                    this.profitInFiat += ((losePrecentage * this.positionSize) - (this.positionSize * (this.tax+this.tax+this.tax*Math.abs(losePrecentage))));
                    if(losePrecentage>=0){this.winCount++;}else{this.loseCount++;}
                }
            }else if(this.type == "sell"){
                if(currentCandle[3] <= this.takeProfit){
                    this.position=false;
                    this.profitInFiat += ((winPrecentage * this.positionSize) - (this.positionSize * (this.tax+this.tax+this.tax*winPrecentage )));
                    this.winCount++;
                }else if(currentCandle[2] >= this.stopLoss){
                    this.position=false;
                    let losePrecentage = (this.entryPrice-this.stopLoss)/this.entryPrice;
                    this.profitInFiat += ((losePrecentage * this.positionSize) - (this.positionSize * (this.tax+this.tax+this.tax*Math.abs(losePrecentage))));
                    if(losePrecentage>=0){this.winCount++;}else{this.loseCount++;}
                }
            }
        }
        this.maxDrawdown = this.maxDrawdown<this.profitInFiat?this.maxDrawdown:this.profitInFiat;
        this.maxGain = this.maxGain>this.profitInFiat?this.maxGain:this.profitInFiat;
    }
    private async streamRunner(){
        while(this.allCandlesData.length>0){
            if(this.currentCandlesData[(this.strategy.mainTimeframe as string)].length==550){ this.currentCandlesData[(this.strategy.mainTimeframe as string)].splice(0,50); };
            this.currentCandlesData[(this.strategy.mainTimeframe as string)].push(this.allCandlesData.pop());
            await this.runStrategy();
            process.stdout.write("\rProfit %: "+this.profitInFiat.toFixed(2)+" "+((this.currentLogData!=null)?this.currentLogData.date:""));
            
        }
    }
    public async start(){
        //LOAD
        for(let date of this.dateToLoad){
            this.readHistory(this.symbolToLoad,this.timeframeToLoad,date.year,date.month.from,date.month.until);
        }
        this.allCandlesData.reverse();
        this.loadCandlesData(this.strategy.mainTimeframe);
        console.log(this.allCandlesData.length);
        //BACKTEST START  
        await this.runStrategy();
        await this.streamRunner();
        //RESULT
        console.log("\nWin: "+this.winCount+", Lost: "+this.loseCount);
        console.log("Profit : "+this.profitInFiat.toFixed(2)+" %");
        console.log("Max Drawdown: "+this.maxDrawdown.toFixed(2)+" %"+", Max Gain: "+this.maxGain.toFixed(2)+" %");
    }
    
}