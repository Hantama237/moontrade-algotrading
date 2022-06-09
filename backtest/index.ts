import { Swing1h } from "../strategy/MyStrategy";
import { Backtest } from "./Backtest";

let backtest = new Backtest(new Swing1h(1),
{
    "dateToLoad":[
        {"year":"2020","month":{"from":1,"until":12}},
        {"year":"2021","month":{"from":1,"until":12}},
        {"year":"2022","month":{"from":1,"until":4}}
    ],
    "symbolToLoad":"LTCUSDT",
    "timeframeToLoad":"1h"
});

backtest.start();
