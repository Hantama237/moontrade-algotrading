import { Binance } from "./Binance";

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

}