import { Swing1h } from "./strategy/MyStrategy";

const riskUSDT = 0.15; //0.15 USDT risk per trade.
const Swing1hConfig = {
    "strategy": new Swing1h(riskUSDT),
    "orderType": "LIMIT"
}

export const TradeConfig = Swing1hConfig;

