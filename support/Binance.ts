import 'dotenv/config'
const BinanceAPI = require('node-binance-api');
export class Binance{
    static binance = new BinanceAPI().options({
        'APIKEY': process.env.API_KEY,
        'APISECRET': process.env.API_SECRET,
        'test': false
    });
    // Intervals: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
    static async getFuturesCandles(timeframe:string="5m",symbol:string="LTCUSDT",limit:number=500){
        return await this.binance.futuresCandles(symbol, timeframe, { limit: limit })
    }
    static async subscribeFuturesCandles(processFunction:any,timeframe:string="5m",symbol:string="ltcusdt"){
        return await this.binance.futuresSubscribe(symbol+'@kline_'+timeframe, processFunction);
    }

    static async getBalance(){
        let response = await this.binance.futuresBalance({asset:"LTCUSDT",recvWindow:100000000});
        let balance:any = {};
        for(let i of response){
            balance[i.asset]=i.balance;
        }
        console.log(balance);
        return balance;
    }
    static async getPosition(symbol:string="LTCUSDT"){
        let response:any = await this.binance.futuresPositionRisk({symbol:symbol,recvWindow:100000000});
        console.log(response);
        return {
            "trade":Math.abs(response[0].positionAmt)>0,
            "ammount":response[0].positionAmt,
            "price":response[0].entryPrice
        };
    }

    static async getOrders(symbol:string="LTCUSDT"){
        let response:any = await this.binance.futuresOpenOrders( symbol ,{recvWindow:100000000});
        console.log(response);
        return response;
    }
    static async cancelAllOrders(symbol:string="LTCUSDT"){
        let response:any = await this.binance.futuresCancelAll(symbol);
        console.log(response);
        return response;
    }

    static async setPositionWithTPSL(params:{quantity:number;slPrice:number;tpPrice:number;type:string;symbol?:any}){
        let response:any = await this.binance.futuresMultipleOrders([
            {
                'newClientOrderId': '467fba09-a286-43c3-a79a-'+(Math.random() + 1).toString(36).substring(7),
                'symbol': params.symbol??"LTCUSDT",
                'type': 'MARKET',
                'quantity': params.quantity,
                'side': (params.type=="sell"?"SELL":"BUY")
            },
            {
                'newClientOrderId': '6925e0cb-2d86-42af-875c-'+(Math.random() + 1).toString(36).substring(7),
                'symbol':params.symbol??"LTCUSDT",
                'type': 'STOP_MARKET',
                'quantity': params.quantity,
                'side': (params.type=="sell"?"BUY":"SELL"),
                'stopPrice': params.slPrice.toString(),
                'timeInForce': 'GTE_GTC',
                'reduceOnly': 'True'
            },
            {
                'newClientOrderId': '6925e0cb-2d86-42af-875c-'+(Math.random() + 1).toString(36).substring(7),
                'symbol':params.symbol??"LTCUSDT",
                'type': 'TAKE_PROFIT_MARKET',
                'quantity': params.quantity,
                'side': (params.type=="sell"?"BUY":"SELL"),
                'stopPrice': params.tpPrice.toString(),
                'timeInForce': 'GTE_GTC',
                'reduceOnly': 'True'
            }
        ]);
        console.log(response);
        return response;
    }

    static async getHistoricalData() {
        console.info(await this.binance.futuresHistDataId(
            "LTCUSDT", {
            startTime: new Date().getTime() - 24 * 60 * 60 * 1000,
            endTime: new Date().getTime(),
            dataType: 'T_TRADE'
        })
        )
    }
    static async getDownloadLink() {
        console.info(await this.binance.futuresDownloadLink(547804))
    }
}

export function parseData(data:any){
    let temp = [
        data.k.t,
        data.k.o,
        data.k.h,
        data.k.l,
        data.k.c,
        data.k.v,
        data.k.T,
        data.k.q,
        data.k.n,
        data.k.V,
        data.k.Q,
        data.k.B,
    ];
    if (data.k.x) {
        return {
            "isClosed":true,
            "data":temp
        };
    } else {
        return {
            "isClosed":false,
            "data":temp
        };
    }
}
export function separateOHLCtoIndividualArray(data:Array<Array<any>>){
    let open:Array<number>  = [];
    let high:Array<number>  = [];
    let low:Array<number>   = [];
    let close:Array<number> = [];
    data.forEach(element => {
        open.push(parseFloat(element[1] as string));
        high.push(parseFloat(element[2] as string));
        low.push(parseFloat(element[3] as string));
        close.push(parseFloat(element[4] as string));
    });
    return {
        "open":open,
        "high":high,
        "low":low,
        "close":close
    };
}