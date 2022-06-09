import { Chart } from "../support/Chart";
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
    static writeLoseLog(content:string){
        let strings:string = "";
        for(let i of content){
            strings += JSON.stringify(i)+"\n";
        }
        fs.writeFile('./backtest/result/lose-log.txt', strings, (err:any) => {
            if (err) {
              console.error(err)
              return
            }
        })
    }
    static writeWinLog(content:string){
        let strings:string = "";
        for(let i of content){
            strings += JSON.stringify(i)+"\n";
        }
        fs.writeFile('./backtest/result/win-log.txt', strings, (err:any) => {
            if (err) {
              console.error(err)
              return
            }
        })
    }
    static writeResultLog(content:string){
        fs.writeFile('./backtest/result/result.txt', content, (err:any) => {
            if (err) {
              console.error(err)
              return
            }
        })
    }
    static calculateMaxDrawDown(data:Array<number>){
        if(data.length<1) return NaN;
        let highest = data[0];
        let drawdown = 0;
        for(let i of data){
            if(i>highest) highest = i;
            let temp = Math.abs(highest-i);
            if(temp>drawdown) drawdown = temp;
        }
        return drawdown;
    }
    static calculateMaxGain(data:Array<number>){
        if(data.length<1) return NaN;
        let lowest = data[0];
        let gain = 0;
        for(let i of data){
            if(i<lowest) lowest = i;
            let temp = Math.abs(i-lowest);
            if(temp>gain) gain = temp;
        }
        return gain;
    }
    static calculateWinRate(win:number,loss:number){
        return (win/(win+loss))*100;
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
    private profitLogData:Array<number> = [];
    private profitLogLabels:Array<string> = [];

    private maxDrawdown = 0 ;
    private maxGain = 0;
    private maxFee = 0;
    private maxSize = 0;

    private totalFee = 0;
    private winCount = 0;
    private loseCount = 0;

    private currentLogData:any = null;
    private loseLog:any = [];
    private winLog:any = [];
    
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
    private setTax(tax:number){
        this.tax = tax;
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
    private appendLogData(){
        this.profitLogData.push(this.profitInFiat);
        this.profitLogLabels.push(this.currentLogData.date.substring(0,10));
    }
    private async runStrategy(){
        let result  = await  this.strategy.updateData(this.currentCandlesData);
        let index = this.currentCandlesData[this.strategy.mainTimeframe].length-1;
        let entry = false;
        if(result.entry && !this.position){
            entry = result.entry;
            this.countCandle = 0;
            this.position = true;
            this.type = result.type;
            this.positionSize = parseFloat(this.strategy.getPositionSize())*this.currentCandlesData[this.strategy.mainTimeframe][index][4];
            this.entryPrice = parseFloat(this.currentCandlesData[this.strategy.mainTimeframe][index][4]);
            this.takeProfit = parseFloat(this.strategy.getTakeProfitAndStopLoss(result.type).tp);
            this.stopLoss = parseFloat(this.strategy.getTakeProfitAndStopLoss(result.type).sl);
            let date = new Date(parseInt(this.currentCandlesData[this.strategy.mainTimeframe][index][0]));
            this.currentLogData = {
                "date":date.toLocaleString(),
                "date_formated":date.getFullYear()+"-"+((date.getMonth()+1)>10?date.getMonth()+1:"0"+(date.getMonth()+1))+"-"+(date.getDate()>10?date.getDate():"0"+date.getDate())+" "+date.toLocaleTimeString(),
                "close":this.currentCandlesData[this.strategy.mainTimeframe][index][4],
                "type":result.type,
                "tp":this.takeProfit,
                "sl":this.stopLoss,
                "indicator":this.strategy.getIndicatorInfo()
            };
            this.maxSize = this.positionSize>this.maxSize?this.positionSize:this.maxSize;
        }
        if(this.position && !entry){
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
            let currentFee = 0;
            if(this.type == "buy"){
                if(currentCandle[2] >= this.takeProfit){
                    this.position=false;
                    currentFee = (this.positionSize * (this.tax+this.tax+this.tax*winPrecentage));
                    this.profitInFiat += ((winPrecentage * this.positionSize) - currentFee);
                    this.winCount++;
                    this.appendLogData();
                    this.winLog.push(this.currentLogData)
                    this.maxFee = currentFee>this.maxFee?currentFee:this.maxFee;
                    this.totalFee +=currentFee;
                }else if(currentCandle[3] <= this.stopLoss){
                    this.position=false;
                    let losePrecentage = (this.stopLoss-this.entryPrice)/this.entryPrice;
                    currentFee = (this.positionSize * (this.tax+this.tax+this.tax*Math.abs(losePrecentage)));
                    this.profitInFiat += ((losePrecentage * this.positionSize) - currentFee);
                    if(losePrecentage>=0){this.winCount++; this.winLog.push(this.currentLogData)}else{this.loseCount++; this.loseLog.push(this.currentLogData)}
                    this.appendLogData();
                    this.maxFee = currentFee>this.maxFee?currentFee:this.maxFee;
                    this.totalFee +=currentFee;
                }
            }else if(this.type == "sell"){
                if(currentCandle[3] <= this.takeProfit){
                    this.position=false;
                    currentFee = (this.positionSize * (this.tax+this.tax+this.tax*winPrecentage));
                    this.profitInFiat += ((winPrecentage * this.positionSize) - currentFee);
                    this.winCount++;
                    this.appendLogData();
                    this.winLog.push(this.currentLogData)
                    this.maxFee = currentFee>this.maxFee?currentFee:this.maxFee;
                    this.totalFee +=currentFee;
                }else if(currentCandle[2] >= this.stopLoss){
                    this.position=false;
                    let losePrecentage = (this.entryPrice-this.stopLoss)/this.entryPrice;
                    currentFee = (this.positionSize * (this.tax+this.tax+this.tax*Math.abs(losePrecentage)))
                    this.profitInFiat += ((losePrecentage * this.positionSize) - currentFee);
                    if(losePrecentage>=0){this.winCount++; this.winLog.push(this.currentLogData)}else{this.loseCount++; this.loseLog.push(this.currentLogData)}
                    this.appendLogData();
                    this.maxFee = currentFee>this.maxFee?currentFee:this.maxFee;
                    this.totalFee +=currentFee;
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
        console.time('Execution time: ');
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
        //console.info(this.loseLog);
        let result = "\n\nWin: "+this.winCount+", Lost: "+this.loseCount+", Win Rate: "+BacktestTool.calculateWinRate(this.winCount,this.loseCount).toFixed(2)+"%\n"+
                     "Profit : "+this.profitInFiat.toFixed(2)+" %\n"+
                     "Max Drawdown: -"+BacktestTool.calculateMaxDrawDown(this.profitLogData).toFixed(2)+" %"+", Max Gain: "+BacktestTool.calculateMaxGain(this.profitLogData).toFixed(2)+" %\n"+
                     "Max Fee: "+(this.maxFee).toFixed(3)+" %, Max Position Size: "+this.maxSize.toFixed(2)+" %, Total Fee: "+this.totalFee.toFixed(3)+" %";
        let chartResult = "Win: "+this.winCount+", Lost: "+this.loseCount+", Win Rate: "+BacktestTool.calculateWinRate(this.winCount,this.loseCount).toFixed(2)+"%, "+
                        "Profit : "+this.profitInFiat.toFixed(2)+" %, "+
                        "Max Drawdown: -"+BacktestTool.calculateMaxDrawDown(this.profitLogData).toFixed(2)+" %"+", Max Gain: "+BacktestTool.calculateMaxGain(this.profitLogData).toFixed(2)+" %"
        Chart.generateEquityChart(this.profitLogData,this.profitLogLabels,chartResult);
        BacktestTool.writeLoseLog(this.loseLog);
        BacktestTool.writeWinLog(this.winLog);
        console.log(result);
        console.timeEnd('Execution time: ');
        console.log('\n\n');
    }
    
}