# moontrade-algotrading
Binance algotrading &amp; backtesting tools in typescript.

Write your strategy once, and use it in backtesting and auto trading with zero changes.
Trade 24 hour carelessly of moon or sun currently above.

First of all, please run this command.
```bash
npm install
```
And then setup the `.env` file using your binance API key, and Telegram API key for notification (optional)

### Features
- Strategy backtester using historical data from binance.
- Backtest result in profit chart, lose and win log saved in txt.
- Auto Trade algoritmic automated binance futures cryptocurrency trading.
- Strategy obfuscator, all `.js` file under `./build/strategy/` folder is obfuscated after build command.
- Hyper parameter optimization to optimize strategy indicator parameters (coming soon).
- Multi strategy support, trade using more than one strategy in multiple cryptocurrency (coming soon).
- Monte Carlo simulation to measure worst trading chance in the future (coming soon).
- Probability Cone to measure live trading peformance and help to decide when to stop the trading (coming soon).

## Automated Trading
Automated strategy configuration located in `./index.ts` this configuration is using strategy located in `./strategy/MyStrategy.ts`, which already contain free `1h` timeframe strategy that I have developed. You can also backtest this strategy by following the backtest section below. Please use this at your own risk. I am not responsible for any risk in using this moontrade-algotrading program.

First step, build the js file
```bash
npm run build
```

And then, to start the trading bot.
```bash
npm run start
```

## Backtesting Strategy
Backtest configuration located in `./backtest/index.ts` this configuration also using strategy located in `./strategy/MyStrategy.ts` that is also used in automated trading section above, after running the backtest the backtest result is printed in the console, and result in some saved files that located in `./backtest/result/`.
- `./backtest/result/profit-chart.png` containing profit chart and other backtesting result such as number of win/loss, win rate, profit %, maximum drawdown % and maximum gain %.
- `./backtest/result/lose-log.txt` and `./backtest/result/win-log.txt` containing win and lose log with some useful trade information such as datetime, price, and indicator info on each win/losing trade.

To start the backtest
```bash
npm run backtest
```

Example `./backtest/result/profit-chart.png` backtest result on `1h` timeframe strategy in `./strategy/MyStrategy.ts`.

![](https://raw.githubusercontent.com/Hantama237/moontrade-algotrading/main/backtest/result/profit-chart.png)
