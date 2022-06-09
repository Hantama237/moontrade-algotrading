import { Binance } from "./Binance";
import { Tulind } from "./Tulind";

//let position = await Binance.getPosition();
//let orders = await Binance.getOrders();
//let setPosition = Binance.setPosition(6,"sell",100);
let setTPSL = Binance.setLimitPositionWithTPSL({"price":71.03,"type":"sell","quantity":0.1,"slPrice":72,"tpPrice":70});
