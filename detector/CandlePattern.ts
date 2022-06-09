export class CandlePattern{
    
    private static bodyLen(data:any) {
        return Math.abs(data.open - data.close);
    }
    
    private static wickLen(data:any) {
        return data.high - Math.max(data.open, data.close);
    }
    
    private static tailLen(data:any) {
        return Math.min(data.open, data.close) - data.low;
    }
    
    static isBullish(data:any) {
        return data.open < data.close;
    }
    
    
    static isBearish(data:any) {
        return data.open > data.close;
    }
    
    static isDoji(data:any){
        return Math.abs(data.close - data.open) / (data.high - data.low) < 0.1 && 
            (data.high - Math.max(data.close, data.open)) > (3 * Math.abs(data.close - data.open)) && 
            (Math.min(data.close, data.open) - data.low) > (3 * Math.abs(data.close - data.open));
    }
    static isHammer(data:any,inverted:boolean = false){
        if(inverted){
            return (((data.high - data.low) > 3 * (data.open - data.close)) &&
                ((data.high - data.close) / (.001 + data.high - data.low) > 0.6) &&
                ((data.high - data.open) / (.001 + data.high - data.low) > 0.6));
        }
        return (((data.high - data.low) > 3 * (data.open - data.close)) &&
            ((data.close - data.low) / (.001 + data.high - data.low) > 0.6) &&
            ((data.open - data.low) / (.001 + data.high - data.low) > 0.6));
    }
    static isEngulfing(prev:any,current:any,inverted:boolean = false){
        return !inverted?(current.close >= prev.open && prev.open > prev.close &&
                current.close > current.open &&
                prev.close >= current.open &&
                current.close - current.open > prev.open - prev.close):
                (current.open >= prev.close && prev.close > prev.open &&
                current.open > current.close &&
                prev.open >= current.close && 
                current.open - current.close > prev.close - prev.open);
    }

    static isCloseOverPrevious(prev:any,current:any,reversed:boolean=false) {
        return reversed?(current.close<prev.low):(current.close>prev.high);
    }
    static isLongTail(data:any,reversed:boolean=false){
        return (reversed?(this.wickLen(data)>this.tailLen(data)):(this.wickLen(data)<this.tailLen(data)))
    }


    static crossover(prev1:number,prev2:number,curr1:number,curr2:number,reversed:boolean=false){
        if(!reversed)return (prev1 <= prev2 && curr1>curr2);
        else return ((prev1 >= prev2 && curr1<curr2));
    }
}