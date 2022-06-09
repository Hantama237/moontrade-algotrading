"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.StrategyTestIndicator = exports.StrategySimplifiedTemplate = exports.StrategyTemplate = exports.StrategyBaseSimplified = void 0;
var Tulind_1 = require("../support/Tulind");
var Binance_1 = require("../support/Binance");
var CandlePattern_1 = require("../detector/CandlePattern");
var StrategyBase = /** @class */ (function () {
    function StrategyBase(mainTimeframe, otherTimeframe) {
        this.CandlesData = {};
        this.OHLCsData = {};
        this.IndicatorsData = {};
        this.riskFiat = NaN;
        this.rewardRatio = NaN;
        this.mainTimeframe = mainTimeframe;
        this.otherTimeframe = otherTimeframe;
    }
    StrategyBase.prototype.getOHLCbyIndex = function (index) {
        var currentCandle = {
            "open": this.OHLCsData[this.mainTimeframe].open[index],
            "high": this.OHLCsData[this.mainTimeframe].high[index],
            "low": this.OHLCsData[this.mainTimeframe].low[index],
            "close": this.OHLCsData[this.mainTimeframe].close[index]
        };
        return currentCandle;
    };
    StrategyBase.prototype.storeOHLC = function () {
        var _this = this;
        this.OHLCsData[this.mainTimeframe] = (0, Binance_1.separateOHLCtoIndividualArray)(this.CandlesData[this.mainTimeframe]);
        this.otherTimeframe.forEach(function (e) {
            _this.OHLCsData[e] = (0, Binance_1.separateOHLCtoIndividualArray)(_this.CandlesData[e]);
        });
    };
    StrategyBase.prototype.initiateIndicatorsObject = function (timeframe, indicator) {
        if (this.IndicatorsData[timeframe] == undefined)
            this.IndicatorsData[timeframe] = {};
        if (this.IndicatorsData[timeframe][indicator] == undefined)
            this.IndicatorsData[timeframe][indicator] = {};
    };
    StrategyBase.prototype.updateData = function (CandlesData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.CandlesData = CandlesData;
                this.storeOHLC();
                return [2 /*return*/];
            });
        });
    };
    StrategyBase.prototype.checkTrailing = function (entryPrice, losePrice, type) {
        return {
            "trailed": false,
            "price": 0,
            "removeTP": false
        };
    };
    StrategyBase.prototype.getIndicatorInfo = function () { };
    StrategyBase.prototype.getCurrentIndex = function () {
        return this.CandlesData[this.mainTimeframe].length - 1;
    };
    StrategyBase.prototype.getTakeProfitAndStopLoss = function (type, atrMultiplier) {
        if (atrMultiplier === void 0) { atrMultiplier = 3; }
        var index = this.CandlesData[this.mainTimeframe].length - 1;
        var atr = this.IndicatorsData[this.mainTimeframe]["atr"][index];
        var currentPrice = this.OHLCsData[this.mainTimeframe].close[index];
        var slPrice = Math.abs((atr * atrMultiplier) + (type == "sell" ? currentPrice : 0) - ((type == "buy" ? currentPrice : 0)));
        var tpPrice = Math.abs((atr * atrMultiplier * this.rewardRatio) + (type == "buy" ? currentPrice : 0) - ((type == "sell" ? currentPrice : 0)));
        return {
            "tp": tpPrice.toFixed(2),
            "sl": slPrice.toFixed(2)
        };
    };
    StrategyBase.prototype.getPositionSize = function () {
        var index = this.CandlesData[this.mainTimeframe].length - 1;
        var currentPrice = this.OHLCsData[this.mainTimeframe].close[index];
        var positionSize = (this.riskFiat / Math.abs(parseFloat(this.getTakeProfitAndStopLoss("buy").sl) - parseFloat(currentPrice)) * currentPrice) / currentPrice;
        return positionSize.toFixed(2);
    };
    StrategyBase.prototype.generateSignal = function (entry, type) {
        var entryPrice = this.getOHLCbyIndex(this.getCurrentIndex()).close;
        var positionSize = this.getPositionSize();
        var TPSL = this.getTakeProfitAndStopLoss(type);
        if (entry)
            return {
                "entry": entry,
                "entryPrice": entryPrice,
                "type": type,
                "size": positionSize,
                "tp": TPSL.tp,
                "sl": TPSL.sl,
                "message": "======= " + (type == "sell" ? "SELL" : "BUY") + " =======\n"
                    + this.getIndicatorInfo() + "\n" +
                    "size:" + positionSize + "\n" +
                    "tp:" + TPSL.tp + "\n" +
                    "sl:" + TPSL.sl + "\n" +
                    "Entry " + type + " potential, pattern detected"
            };
        else
            return {
                "entry": entry,
                "entryPrice": this.getOHLCbyIndex(this.getCurrentIndex()).close,
                "type": type,
                "size": positionSize,
                "tp": TPSL.tp,
                "sl": TPSL.sl,
                "message": this.getIndicatorInfo() +
                    "No entry potential"
            };
    };
    StrategyBase.prototype.exitAfterCandles = function () {
        return -1;
    };
    return StrategyBase;
}());
var StrategyBaseSimplified = /** @class */ (function (_super) {
    __extends(StrategyBaseSimplified, _super);
    function StrategyBaseSimplified(timeframe, riskFiat, rewardRatio) {
        if (timeframe === void 0) { timeframe = "1h"; }
        var _this = _super.call(this, timeframe, []) || this;
        _this.riskFiat = riskFiat;
        _this.rewardRatio = rewardRatio;
        return _this;
    }
    StrategyBaseSimplified.prototype.updateData = function (CandlesData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _super.prototype.updateData.call(this, CandlesData);
                        return [4 /*yield*/, this.calculateIndicators()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.checkEntry()];
                }
            });
        });
    };
    StrategyBaseSimplified.prototype.calculateIndicators = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    StrategyBaseSimplified.prototype.getIndicatorInfo = function () {
        var index = this.getCurrentIndex();
        var indicatorInfo = "CLOSE : " + this.OHLCsData[this.mainTimeframe].close[index] + "\n";
        return indicatorInfo;
    };
    StrategyBaseSimplified.prototype.checkEntry = function () { };
    StrategyBaseSimplified.prototype.addIndicator = function (name, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
            return __generator(this, function (_1) {
                switch (_1.label) {
                    case 0:
                        _a = name;
                        switch (_a) {
                            case "ema": return [3 /*break*/, 1];
                            case "emaold": return [3 /*break*/, 3];
                            case "atr": return [3 /*break*/, 5];
                            case "atrnew": return [3 /*break*/, 7];
                            case "psar": return [3 /*break*/, 9];
                            case "psarnew": return [3 /*break*/, 11];
                            case "rsi": return [3 /*break*/, 13];
                            case "macd": return [3 /*break*/, 15];
                            case "kc": return [3 /*break*/, 17];
                            case "dc": return [3 /*break*/, 19];
                            case "chandelierexit": return [3 /*break*/, 21];
                            case "adx": return [3 /*break*/, 23];
                        }
                        return [3 /*break*/, 25];
                    case 1:
                        //options: length
                        this.initiateIndicatorsObject(this.mainTimeframe, "ema");
                        _b = this.IndicatorsData[this.mainTimeframe]["ema"];
                        _c = options.length;
                        return [4 /*yield*/, Tulind_1.Tulind.getEMA(options.length, this.OHLCsData[this.mainTimeframe].close)];
                    case 2:
                        _b[_c] = _1.sent();
                        return [3 /*break*/, 26];
                    case 3:
                        //options: length
                        this.initiateIndicatorsObject(this.mainTimeframe, "ema");
                        _d = this.IndicatorsData[this.mainTimeframe]["ema"];
                        _e = options.length;
                        return [4 /*yield*/, Tulind_1.Tulind.getEMAOld(options.length, this.OHLCsData[this.mainTimeframe].close)];
                    case 4:
                        _d[_e] = _1.sent();
                        return [3 /*break*/, 26];
                    case 5:
                        //options: length
                        this.initiateIndicatorsObject(this.mainTimeframe, "atr");
                        _f = this.IndicatorsData[this.mainTimeframe];
                        _g = "atr";
                        return [4 /*yield*/, Tulind_1.Tulind.getATROld(options.length, this.OHLCsData[this.mainTimeframe].high, this.OHLCsData[this.mainTimeframe].low, this.OHLCsData[this.mainTimeframe].close)];
                    case 6:
                        _f[_g] = _1.sent();
                        return [3 /*break*/, 26];
                    case 7:
                        //options: length
                        this.initiateIndicatorsObject(this.mainTimeframe, "atr");
                        _h = this.IndicatorsData[this.mainTimeframe];
                        _j = "atr";
                        return [4 /*yield*/, Tulind_1.Tulind.getATR(options.length, this.OHLCsData[this.mainTimeframe].high, this.OHLCsData[this.mainTimeframe].low, this.OHLCsData[this.mainTimeframe].close)];
                    case 8:
                        _h[_j] = _1.sent();
                        _1.label = 9;
                    case 9:
                        //options: step,max 
                        this.initiateIndicatorsObject(this.mainTimeframe, "psar");
                        _k = this.IndicatorsData[this.mainTimeframe];
                        _l = "psar";
                        return [4 /*yield*/, Tulind_1.Tulind.getPSAROld(this.OHLCsData[this.mainTimeframe].high, this.OHLCsData[this.mainTimeframe].low, options.step, options.max)];
                    case 10:
                        _k[_l] = _1.sent(); //max 0.03 default 0.2
                        return [3 /*break*/, 26];
                    case 11:
                        this.initiateIndicatorsObject(this.mainTimeframe, "psar");
                        _m = this.IndicatorsData[this.mainTimeframe];
                        _o = "psar";
                        return [4 /*yield*/, Tulind_1.Tulind.getPSAR(this.OHLCsData[this.mainTimeframe].high, this.OHLCsData[this.mainTimeframe].low, options.step, options.max)];
                    case 12:
                        _m[_o] = _1.sent(); //max 0.03 default 0.2
                        return [3 /*break*/, 26];
                    case 13:
                        //options: length
                        this.initiateIndicatorsObject(this.mainTimeframe, "rsi");
                        _p = this.IndicatorsData[this.mainTimeframe];
                        _q = "rsi";
                        return [4 /*yield*/, Tulind_1.Tulind.getRSI(options.length, this.OHLCsData[this.mainTimeframe].close)];
                    case 14:
                        _p[_q] = _1.sent(); //max 0.03 default 0.2
                        return [3 /*break*/, 26];
                    case 15:
                        //options: short, long, signal
                        this.initiateIndicatorsObject(this.mainTimeframe, "macd");
                        _r = this.IndicatorsData[this.mainTimeframe];
                        _s = "macd";
                        return [4 /*yield*/, Tulind_1.Tulind.getMACD(options.short, options.long, options.signal, this.OHLCsData[this.mainTimeframe].close)];
                    case 16:
                        _r[_s] = _1.sent();
                        _1.label = 17;
                    case 17:
                        //options: length, multiplier
                        this.initiateIndicatorsObject(this.mainTimeframe, "kc");
                        _t = this.IndicatorsData[this.mainTimeframe];
                        _u = "kc";
                        return [4 /*yield*/, Tulind_1.Tulind.getKC(options.length, options.multiplier, this.OHLCsData[this.mainTimeframe].high, this.OHLCsData[this.mainTimeframe].close, this.OHLCsData[this.mainTimeframe].low)];
                    case 18:
                        _t[_u] = _1.sent();
                        _1.label = 19;
                    case 19:
                        //options: length, percentage
                        this.initiateIndicatorsObject(this.mainTimeframe, "dc");
                        _v = this.IndicatorsData[this.mainTimeframe];
                        _w = "dc";
                        return [4 /*yield*/, Tulind_1.Tulind.getDC(options.length, options.percentage, this.OHLCsData[this.mainTimeframe].close)];
                    case 20:
                        _v[_w] = _1.sent();
                        _1.label = 21;
                    case 21:
                        //options: length, multiplier
                        this.initiateIndicatorsObject(this.mainTimeframe, "chandelierexit");
                        _x = this.IndicatorsData[this.mainTimeframe];
                        _y = "chandelierexit";
                        return [4 /*yield*/, Tulind_1.Tulind.getChandelierExit(options.length, options.multiplier, this.OHLCsData[this.mainTimeframe].high, this.OHLCsData[this.mainTimeframe].close, this.OHLCsData[this.mainTimeframe].low)];
                    case 22:
                        _x[_y] = _1.sent();
                        _1.label = 23;
                    case 23:
                        //options: length
                        this.initiateIndicatorsObject(this.mainTimeframe, "adx");
                        _z = this.IndicatorsData[this.mainTimeframe];
                        _0 = "adx";
                        return [4 /*yield*/, Tulind_1.Tulind.getADX(options.length, this.OHLCsData[this.mainTimeframe].high, this.OHLCsData[this.mainTimeframe].low, this.OHLCsData[this.mainTimeframe].close)];
                    case 24:
                        _z[_0] = _1.sent();
                        _1.label = 25;
                    case 25: return [3 /*break*/, 26];
                    case 26: return [2 /*return*/];
                }
            });
        });
    };
    StrategyBaseSimplified.prototype.getIndicator = function (name, index, length) {
        if (length === void 0) { length = NaN; }
        if (!isNaN(length))
            return this.IndicatorsData[this.mainTimeframe][name][length][index];
        else
            return this.IndicatorsData[this.mainTimeframe][name][index];
    };
    return StrategyBaseSimplified;
}(StrategyBase));
exports.StrategyBaseSimplified = StrategyBaseSimplified;
//==== TEMPLATE ====//
var StrategyTemplate = /** @class */ (function (_super) {
    __extends(StrategyTemplate, _super);
    function StrategyTemplate() {
        var _this = _super.call(this, "5m", []) || this;
        // ================================= TRADE FUNCTION =============================== //
        //to get stoploss and take profit
        _this.slATRMultiplier = 1;
        _this.tpATRMultiplier = 2;
        //to get position size
        _this.riskUSDT = 1;
        return _this;
    }
    //called each time candles update
    StrategyTemplate.prototype.updateData = function (CandlesData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _super.prototype.updateData.call(this, CandlesData);
                        return [4 /*yield*/, this.calculateIndicators()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.checkEntry()];
                }
            });
        });
    };
    //define the indicators
    StrategyTemplate.prototype.calculateIndicators = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, e;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        //KC 37 3, EMA 50 & 200, ATR: break KC, KC mid < 2*ATR, trend direction EMA, sl KC mid/ATR*3, 1:2 RR
                        this.initiateIndicatorsObject(this.mainTimeframe, "atr");
                        _a = this.IndicatorsData[this.mainTimeframe]["atr"];
                        _b = 14;
                        return [4 /*yield*/, Tulind_1.Tulind.getATR(14, this.OHLCsData[this.mainTimeframe].high, this.OHLCsData[this.mainTimeframe].low, this.OHLCsData[this.mainTimeframe].close)];
                    case 1:
                        _a[_b] = _c.sent();
                        for (e in this.otherTimeframe) {
                            //additional timeframe
                        }
                        ;
                        return [2 /*return*/];
                }
            });
        });
    };
    //indicator info to be printed  
    StrategyTemplate.prototype.getIndicatorInfo = function () {
        _super.prototype.getIndicatorInfo.call(this);
        var index = this.CandlesData[this.mainTimeframe].length - 1;
        var indicatorInfo = "CLOSE : " + this.OHLCsData[this.mainTimeframe].close[index] + "\n" +
            "ATR: " + this.IndicatorsData[this.mainTimeframe]["atr"][14][index];
        return indicatorInfo;
    };
    StrategyTemplate.prototype.checkEntry = function () {
        var index = this.CandlesData[this.mainTimeframe].length - 1;
        var bbandsIndex = this.IndicatorsData[this.mainTimeframe]["bbands"][1].length - 1;
        var prevCandle = this.getOHLCbyIndex(index - 1);
        var currentCandle = this.getOHLCbyIndex(index);
        //=== general entry prequirements
        var entryRequirement = true;
        //Decide Short or Long
        var shortRequirement = this.IndicatorsData[this.mainTimeframe]["ema"][37][index] < this.IndicatorsData[this.mainTimeframe]['ema'][90][index];
        if (shortRequirement) {
            //check for short signal
            var sellRequirement = CandlePattern_1.CandlePattern.isBearish(currentCandle) && (CandlePattern_1.CandlePattern.isDoji(prevCandle));
            if (entryRequirement && sellRequirement)
                return this.generateSignal(true, "sell");
        }
        else {
            //check for long signal
            var buyRequirement = CandlePattern_1.CandlePattern.isBullish(currentCandle) && (CandlePattern_1.CandlePattern.isDoji(prevCandle));
            if (entryRequirement && buyRequirement)
                return this.generateSignal(true, "buy");
        }
        return this.generateSignal(false, "none");
    };
    StrategyTemplate.prototype.getTakeProfitAndStopLoss = function (type) {
        if (type === void 0) { type = "buy"; }
        var index = this.CandlesData[this.mainTimeframe].length - 1;
        var atr = this.IndicatorsData[this.mainTimeframe]["atr"][14][index];
        var currentPrice = this.OHLCsData[this.mainTimeframe].close[index];
        var slPrice = Math.abs((atr * this.slATRMultiplier) + (type == "sell" ? currentPrice : 0) - ((type == "buy" ? currentPrice : 0)));
        var tpPrice = Math.abs((atr * this.tpATRMultiplier) + (type == "buy" ? currentPrice : 0) - ((type == "sell" ? currentPrice : 0)));
        return {
            "tp": tpPrice.toFixed(2),
            "sl": slPrice.toFixed(2)
        };
    };
    StrategyTemplate.prototype.getPositionSize = function () {
        var index = this.CandlesData[this.mainTimeframe].length - 1;
        var currentPrice = this.OHLCsData[this.mainTimeframe].close[index];
        var TPSL = this.getTakeProfitAndStopLoss();
        var positionSize = (this.riskUSDT / Math.abs(parseFloat(TPSL.sl) - parseFloat(currentPrice)) * currentPrice) / currentPrice;
        return positionSize.toFixed(2).toString();
    };
    //#OPTIONAL trend follower only
    StrategyTemplate.prototype.updateTrailingStop = function () {
        //TODO: generate trailing stop
    };
    return StrategyTemplate;
}(StrategyBase));
exports.StrategyTemplate = StrategyTemplate;
var StrategySimplifiedTemplate = /** @class */ (function (_super) {
    __extends(StrategySimplifiedTemplate, _super);
    function StrategySimplifiedTemplate() {
        //set timeframe, risk in fiat, reward ratio (1:3)= 3 reward ratio 
        return _super.call(this, "1h", 1, 1.33) || this;
    }
    StrategySimplifiedTemplate.prototype.getIndicatorInfo = function () {
        var index = this.getCurrentIndex();
        var indicatorInfo = _super.prototype.getIndicatorInfo.call(this);
        //TODO: add other indicator info
        return indicatorInfo;
    };
    StrategySimplifiedTemplate.prototype.calculateIndicators = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    //required by getTakeProfitAndStopLoss, override if use different method
                    return [4 /*yield*/, _super.prototype.addIndicator.call(this, "atr", { "length": 14 })];
                    case 1:
                        //required by getTakeProfitAndStopLoss, override if use different method
                        _a.sent();
                        //register the indicators
                        return [4 /*yield*/, _super.prototype.addIndicator.call(this, "ema", { "length": 37 })];
                    case 2:
                        //register the indicators
                        _a.sent();
                        return [4 /*yield*/, _super.prototype.addIndicator.call(this, "ema", { "length": 90 })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StrategySimplifiedTemplate.prototype.checkEntry = function () {
        return __awaiter(this, void 0, void 0, function () {
            var current, entryRequirements, shortRequirements, sellRequirements, buyRequirements;
            return __generator(this, function (_a) {
                current = this.getCurrentIndex();
                entryRequirements = [];
                shortRequirements = [this.getIndicator("ema", current, 37) < this.getIndicator("ema", current, 90)];
                if (shortRequirements.every(Boolean)) {
                    sellRequirements = [
                        CandlePattern_1.CandlePattern.isEngulfing(this.getOHLCbyIndex(current - 1), this.getOHLCbyIndex(current), true),
                    ];
                    if (sellRequirements.every(Boolean))
                        return [2 /*return*/, this.generateSignal(true, "sell")]; // make a sell signal
                }
                else {
                    buyRequirements = [
                        CandlePattern_1.CandlePattern.isEngulfing(this.getOHLCbyIndex(current - 1), this.getOHLCbyIndex(current)),
                    ];
                    if (buyRequirements.every(Boolean))
                        return [2 /*return*/, this.generateSignal(true, "buy")]; // make a buy signal
                }
                return [2 /*return*/, this.generateSignal(false, "none")]; //if no signal
            });
        });
    };
    //get take profit and stoploss
    StrategySimplifiedTemplate.prototype.getTakeProfitAndStopLoss = function (type) {
        return _super.prototype.getTakeProfitAndStopLoss.call(this, type, 3); // default method ex: {tp:20.11,sl:30.11}
    };
    StrategySimplifiedTemplate.prototype.getPositionSize = function () {
        return _super.prototype.getPositionSize.call(this); // default method ex: 12.30
    };
    return StrategySimplifiedTemplate;
}(StrategyBaseSimplified));
exports.StrategySimplifiedTemplate = StrategySimplifiedTemplate;
//==== TEST INDICATOR ====//
var StrategyTestIndicator = /** @class */ (function (_super) {
    __extends(StrategyTestIndicator, _super);
    function StrategyTestIndicator() {
        //set timeframe, risk in fiat, reward ratio (1:3)= 3 reward ratio 
        return _super.call(this, "5m", 0.02, 1.33) || this;
    }
    StrategyTestIndicator.prototype.getIndicatorInfo = function () {
        var index = this.getCurrentIndex();
        var indicatorInfo = _super.prototype.getIndicatorInfo.call(this);
        indicatorInfo += "CExit : " + this.getIndicator("chandelierexit", 0)[index] + ", " + this.getIndicator("chandelierexit", 1)[index] + ", " + this.getIndicator("chandelierexit", 2)[index] + "\n";
        indicatorInfo += "ATR : " + this.getIndicator("atr", index) + "\n";
        return indicatorInfo;
    };
    StrategyTestIndicator.prototype.calculateIndicators = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    //required by getTakeProfitAndStopLoss, override if use different method
                    return [4 /*yield*/, _super.prototype.addIndicator.call(this, "atr", { "length": 14 })];
                    case 1:
                        //required by getTakeProfitAndStopLoss, override if use different method
                        _a.sent();
                        //register the indicators
                        return [4 /*yield*/, _super.prototype.addIndicator.call(this, "ema", { "length": 37 })];
                    case 2:
                        //register the indicators
                        _a.sent();
                        return [4 /*yield*/, _super.prototype.addIndicator.call(this, "ema", { "length": 90 })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, _super.prototype.addIndicator.call(this, "chandelierexit", { "length": 1, "multiplier": 2 })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StrategyTestIndicator.prototype.checkEntry = function () {
        return __awaiter(this, void 0, void 0, function () {
            var index, entryRequirements, buyRequirements, sellRequirements;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.generateSignal(true, "sell")];
            });
        });
    };
    //get take profit and stoploss
    StrategyTestIndicator.prototype.getTakeProfitAndStopLoss = function (type) {
        return _super.prototype.getTakeProfitAndStopLoss.call(this, type, 1); //3 is the multiplier, default method atr based, return ex: {tp:20.11,sl:30.11}
    };
    StrategyTestIndicator.prototype.getPositionSize = function () {
        return _super.prototype.getPositionSize.call(this); // default method return ex: 12.30
    };
    StrategyTestIndicator.prototype.exitAfterCandles = function () {
        return 20;
    };
    return StrategyTestIndicator;
}(StrategyBaseSimplified));
exports.StrategyTestIndicator = StrategyTestIndicator;
