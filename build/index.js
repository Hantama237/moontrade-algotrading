"use strict";
exports.__esModule = true;
exports.TradeConfig = void 0;
var MyStrategy_1 = require("./strategy/MyStrategy");
var riskUSDT = 0.15;
var Swing1hConfig = {
    "strategy": new MyStrategy_1.Swing1h(riskUSDT),
    "orderType": "LIMIT"
};
exports.TradeConfig = Swing1hConfig;
