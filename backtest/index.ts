import { Backtest, BacktestTool } from "./Backtest";
import { StrategyTestIndicator } from "../strategy/Strategy";
import { Strategy5mV1, Strategy5mV2Psar } from "../strategy/Strategy5m";
import { Strategy1hV1 } from "../strategy/Strategy1h";
//TODO: paramter optimization, trailing stop
// main();
console.time('Execution time: ');
let backtest = new Backtest(new Strategy5mV2Psar(),
{
    "dateToLoad":[
        //{"year":"2020","month":{"from":1,"until":12}},
        {"year":"2021","month":{"from":11,"until":12}},
        {"year":"2022","month":{"from":1,"until":4}}
    ],
    "symbolToLoad":"LTCUSDT",
    "timeframeToLoad":"5m"
});

async function main() {
    await backtest.start();
    console.timeEnd('Execution time: ');
}
main();
