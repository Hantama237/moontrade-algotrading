const TA = require('tulind');
const TAJS = require('ta.js');
//const TALIB = require('technicalindicators');

export class Tulind{
    static convertData(input:Array<any>){
        let data:Array<Array<number>> = [];
        for(let i=0;i<input[0].length;i++){
            let temp = [];
            if(input[0]){
                temp.push(input[0][i]);
            }
            if(input[1]){
                temp.push(input[1][i]);
            }
            if(input[2]){
                temp.push(input[2][i]);
            }
            data.push(temp);
        }
        return data;
    }
    static fillEmptyData(input:any,length:number){
        let result = input;
        for(;input.length<length;){
            result.unshift(null)
        }
        return result;
    }
    static async getATR(length:number,high:Array<number>,low:Array<number>,close:Array<number>){
        let result = await TAJS.atr(this.convertData([high,low,close]),length);
        result = this.fillEmptyData(result,high.length);
        return result;
    }
    static async getEMA(length:number,data:Array<number>){
        let result = await TAJS.ema(data,length);
        result = this.fillEmptyData(result,data.length);
        return result;
        
    }
    static async getADX(length:number,high:Array<number>,low:Array<number>,close:Array<number>){
        let result:Array<number>=[];
        TA.indicators.adx.indicator([high,low,close], [length], function (err: any, results: any) {
            result = results[0] as Array<number>;
        });
        result = this.fillEmptyData(result,high.length);
        return result;
    }
    static async getRSI(length:number,data:Array<number>){
        let result:Array<number>=await TAJS.rsi(data,length);
        result = this.fillEmptyData(result,data.length);
        return result;
    }
    static async getPSAR(high:Array<number>,low:Array<number>,step:number,max:number){
        let result = await TAJS.psar(this.convertData([high,low]),step,max);
        result = this.fillEmptyData(result,high.length);
        return result;
    }
    static async getBB(length:number,multiplier:number,data:Array<number>){
        let result = await TAJS.bands(data,length,multiplier);
        result = this.fillEmptyData(result,data.length);
        return result;
    }
    static async getMACD(short:number, long:number, signal:number, data:Array<number>){
        let result:Array<Array<number>>=[];
        TA.indicators.macd.indicator([data], [short,long,signal], function (err: any, results: any) {
            result.push(results[0]);
            result.push(results[1]);
            result.push(results[2]);
        });
        return result;
    }
    static async getKC(length:number, multiplier:number, high:Array<number>,close:Array<number>,low:Array<number>){   
        let result = await TAJS.keltner(this.convertData([high,close,low]),length,multiplier);
        result = this.fillEmptyData(result,high.length);
        return result;
    }
    static async getDC(length:number,percentage:number,data:Array<number>){
        let result = await TAJS.don(data,length,percentage);
        result = this.fillEmptyData(result,data.length);
        return result;
    }

    static getTA(){
        return TA;
    }
    static highest(data:Array<number>,currentIndex:number,length:number){
        let highest = 0;
        for(let i = currentIndex;i>currentIndex-length; i--){
            if(data[i]>highest) highest = data[i];
        }
        return highest;
    }
    static lowest(data:Array<number>,currentIndex:number,length:number){
        let lowest = 100000000;
        for(let i = currentIndex;i>currentIndex-length; i--){
            if(data[i]<lowest) lowest = data[i];
        }
        return lowest;
    }
    static roundNumber(num:number, dec:number) {
        return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
      }
    static async getChandelierExit(length:number,multiplier:number,high:Array<number>,close:Array<number>,low:Array<number>,precision=2){
        let atr = await this.getATROld(length,high,low,close);
        let chandelierExitLong = [];
        let chandelierExitShort = [];
        let directions = []
        for(let i=length-1;i<atr.length;i++){
            let longStop:number = this.highest(close,i,length) - this.roundNumber(atr[i],precision)*multiplier;
            longStop = this.roundNumber(longStop,precision)
            let longStopPrev:number = chandelierExitLong.length>0?chandelierExitLong[chandelierExitLong.length-1]:longStop;//isNaN(chandelierExitLong[chandelierExitLong.length-1])?longStop:chandelierExitLong[chandelierExitLong.length-1]; 
            //longStop = close[i-1] > longStopPrev ? Math.max(longStop, longStopPrev) : longStop;
    
            let shortStop:number = this.lowest(close,i,length) + this.roundNumber(atr[i],precision)*multiplier;
            shortStop = this.roundNumber(shortStop,precision);
            let shortStopPrev:number = chandelierExitShort.length>0?chandelierExitShort[chandelierExitShort.length-1]:shortStop;//isNaN(chandelierExitShort[chandelierExitShort.length-1])?shortStop:chandelierExitShort[chandelierExitShort.length-1]; 
            //shortStop = close[i-1] < shortStopPrev ? Math.min(shortStop, shortStopPrev) : shortStop;
            
            chandelierExitLong.push(longStop);
            chandelierExitShort.push(shortStop);
            let dir = 1
            dir = close[i] > shortStopPrev ? 1 : close[i] < longStopPrev ? -1 : dir;
            directions.push(dir);
            
        }
        chandelierExitLong = await this.fillEmptyData(chandelierExitLong,high.length);
        chandelierExitShort = await this.fillEmptyData(chandelierExitShort,high.length);
        directions = this.fillEmptyData(directions,high.length);
        return [chandelierExitLong,chandelierExitShort,directions];
    }

    // ================== PREV function =============
    static atrOld(data:any, length:number=14) {
        for(var i = 1, atr = [data[0][0] - data[0][2]]; i < data.length; i++) {
          var t0 = Math.max((data[i][0] - data[i - 1][1]), (data[i][2] - data[i - 1][1]), (data[i][0] - data[i][2]));
          atr.push((atr[atr.length - 1] * (length - 1) + t0) / length);
        }
        return atr;
    }
    static getEMAOld(length:number,data:Array<number>):Array<number>{
        let result:Array<number>=[];
        TA.indicators.ema.indicator([data], [length], function (err: any, results: any) {
            result = results[0] as Array<number>;
        });
        return result;
    }
    static getSMMAOld(length:number,data:Array<number>):Array<number>{
        for(var i = length, smma:any = []; i <= data.length; i++) {
            var pl = data.slice(i-length,i), average = 0;
            for(let q in pl) average += pl[q];
            if(smma.length <= 0) { smma.push(average / length); } else { smma.push((average - smma[smma.length - 1]) / length); }
        }
        smma.splice(0, 1);
        return smma;
    }
    static getBBOld(length:number,multiplier:number,data:Array<number>){
        let result:Array<Array<number>>=[];
        TA.indicators.bbands.indicator([data], [length,multiplier], function (err: any, results: any) {
            result.push(results[0]);
            result.push(results[2]);
        });
        return result;
    }
    static getATROld(length:number,high:Array<number>,low:Array<number>,close:Array<number>):Array<number>{
        let data:Array<Array<number>> = [];
        for(let i=0;i<high.length;i++){
            let temp = [];
            temp.push(high[i]);
            temp.push(close[i]);
            temp.push(low[i]);
            data.push(temp);
        }
        return this.atrOld(data,length);
    }
    static getMACDOld(short:number, long:number, signal:number, data:Array<number>){
        let result:Array<Array<number>>=[];
        TA.indicators.macd.indicator([data], [short,long,signal], function (err: any, results: any) {
            result.push(results[0]);
            result.push(results[1]);
            result.push(results[2]);
        });
        return result;
    }
    static getPSAROld(high:Array<number>,low:Array<number>,step:number,max:number){
        let result:Array<number>=[];
        TA.indicators.psar.indicator([high,low], [step,max], function (err: any, results: any) {
            result = results[0] as Array<number>;
        });
        return result;
        // let data:Array<Array<number>> = [];
        // for(let i=0;i<high.length;i++){
        //     let temp = [];
        //     temp.push(high[i]);
        //     temp.push(low[i]);
        //     data.push(temp);
        // }
        // let furthest = data[0], up = true, accel = step, prev = data[0],
        // sar = data[0][1], extreme = data[0][0], final = [sar];
        // for(let i = 1; i < data.length; i++) {
        //     sar = sar + accel * (extreme - sar);
        //     if(up) {
        //     sar = Math.min(sar, furthest[1], prev[1]);
        //     if(data[i][0] > extreme) {
        //         extreme = data[i][0];
        //         accel = Math.min(accel+step, max);
        //     }
        //     } else {
        //     sar = Math.max(sar, furthest[0], prev[0]);
        //     if(data[i][1] < extreme) {
        //         extreme = data[i][0];
        //         accel = Math.min(accel + step, max);
        //     }
        //     }
        //     if((up && data[i][1] < sar) || (!up && data[i][0] > sar)) {
        //     accel = step;
        //     sar = extreme;
        //     up = !up;
        //     extreme = !up ? data[i][1] : data[i][0]
        //     }
        //     furthest = prev;
        //     prev = data[i];
        //     final.push(sar);
        // }
        // return final;
    }
    // static getSuperTrend(multiplier:number=3,period:number=10,high:Array<number>,low:Array<number>,close:Array<number>){
    //     let atr = this.getATR(10,high,low,close);
    //     // baseUp , baseDown
    //     var baseUp = []
    //     var baseDown = []
    //     for (var i = 0; i < atr.length; i++) {
    //         if (isNaN(atr[i])) {
    //             baseUp.push(NaN)
    //             baseDown.push(NaN)
    //             continue
    //         }
    //         baseUp.push((high[i] + low[i]) / 2 + multiplier * atr[i])
    //         baseDown.push((high[i] + low[i]) / 2 - multiplier * atr[i])
    //     }
        
    //     // fiUp , fiDown
    //     var fiUp = []
    //     var fiDown = []
    //     var prevFiUp = 0
    //     var prevFiDown = 0
    //     for (var i = 0; i < atr.length; i++) {
    //         if (isNaN(baseUp[i])) {
    //             fiUp.push(NaN)
    //         } else {
    //             fiUp.push(baseUp[i] < prevFiUp || close[i - 1] > prevFiUp ? baseUp[i] : prevFiUp)
    //             prevFiUp = fiUp[i]
    //         }

    //         if (isNaN(baseDown[i])) {
    //             fiDown.push(NaN)
    //         } else {
    //             fiDown.push(baseDown[i] > prevFiDown || close[i - 1] < prevFiDown ? baseDown[i] : prevFiDown)
    //             prevFiDown = fiDown[i]
    //         }
    //     }
        
    //     var st = []
    //     var prevSt = NaN
    //     for (var i = 0; i < atr.length; i++) {
    //         if (i < period) {
    //             st.push(NaN)
    //             continue
    //         }
    //         console.log(prevSt +" == "+ fiUp[i - 1])
    //         var nowSt = NaN;
    //         if (((isNaN(prevSt)) || prevSt == fiUp[i - 1]) && close[i] <= fiUp[i]) {
    //             nowSt = fiUp[i]
    //             console.log("1 "+nowSt);
    //         } else if (((isNaN(prevSt)) || prevSt == fiUp[i - 1]) && close[i] > fiUp[i]) {
    //             nowSt = fiDown[i]
    //             console.log("2 "+nowSt);
    //         } else if (((isNaN(prevSt)) || prevSt == fiDown[i - 1]) && close[i] >= fiDown[i]) {
    //             nowSt = fiDown[i]
    //             console.log("3 "+nowSt);
    //         } else if (((isNaN(prevSt)) || prevSt == fiDown[i - 1]) && close[i] < fiDown[i]) {
    //             nowSt = fiUp[i]
    //             console.log("4 "+nowSt);
    //         }

    //         st.push(nowSt)
    //         prevSt = st[i]
    //     }
       

    //     var up = []
    //     var down = []
    //     for (var i = 0; i < atr.length; i++) {
    //         if (isNaN(st[i])) {
    //             up.push(st[i])
    //             down.push(st[i])
    //         }

    //         if (close[i] < st[i]) {
    //             down.push(st[i])
    //             up.push(NaN)
    //         } else {
    //             down.push(NaN)
    //             up.push(st[i])
    //         }
    //     }
    //     console.log(st);
    //     return st;//[up, down]
    // }
}

//console.log(TA.indicators); 