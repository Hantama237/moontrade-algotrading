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
exports.Swing1h = void 0;
var Strategy_1 = require("./Strategy");
var CandlePattern_1 = require("../detector/CandlePattern");
// ================ 1h ================ //
var Swing1h = /** @class */ (function (_super) {
    __extends(Swing1h, _super);
    function Swing1h(riskUSDT) {
        if (riskUSDT === void 0) { riskUSDT = 1; }
        //set timeframe, risk in fiat, reward ratio (1:3)= 3 reward ratio 
        return _super.call(this, "1h", riskUSDT, 2.0) || this;
    }
    Swing1h.prototype.getIndicatorInfo = function () {
        var index = this.getCurrentIndex();
        var indicatorInfo = _super.prototype.getIndicatorInfo.call(this);
        //TODO: add other indicator info
        return indicatorInfo;
    };
    Swing1h.prototype.calculateIndicators = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    //required by getTakeProfitAndStopLoss, override if use different method
                    return [4 /*yield*/, _super.prototype.addIndicator.call(this, "atr", { "length": 10 })];
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
                        return [4 /*yield*/, _super.prototype.addIndicator.call(this, "psar", { "step": 0.02, "max": 0.03 })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Swing1h.prototype.checkEntry = function () {
        return __awaiter(this, void 0, void 0, function () {
            var current, entryRequirements, shortRequirements, sellRequirements, buyRequirements;
            return __generator(this, function (_a) {
                current = this.getCurrentIndex();
                entryRequirements = [
                    Math.abs(this.getOHLCbyIndex(current - 1).close - this.getIndicator("ema", current, 37)) < this.getIndicator("atr", current) * 1,
                    Math.abs(this.getOHLCbyIndex(current).close - this.getIndicator("ema", current, 37)) < this.getIndicator("atr", current) * 1
                ];
                shortRequirements = [this.getIndicator("ema", current, 37) < this.getIndicator("ema", current, 90)];
                if (shortRequirements.every(Boolean)) {
                    sellRequirements = [
                        entryRequirements.every(Boolean),
                        this.getOHLCbyIndex(current).high < this.getIndicator("psar", current - 1),
                        (CandlePattern_1.CandlePattern.isDoji(this.getOHLCbyIndex(current - 1)) || CandlePattern_1.CandlePattern.isHammer(this.getOHLCbyIndex(current - 1), true)) && CandlePattern_1.CandlePattern.isLongTail(this.getOHLCbyIndex(current), true)
                    ];
                    if (sellRequirements.every(Boolean))
                        return [2 /*return*/, this.generateSignal(true, "sell")]; // make a sell signal
                }
                else {
                    buyRequirements = [
                        entryRequirements.every(Boolean),
                        this.getOHLCbyIndex(current).low > this.getIndicator("psar", current - 1),
                        (CandlePattern_1.CandlePattern.isDoji(this.getOHLCbyIndex(current - 1)) || CandlePattern_1.CandlePattern.isHammer(this.getOHLCbyIndex(current - 1), false)) && CandlePattern_1.CandlePattern.isLongTail(this.getOHLCbyIndex(current), false)
                    ];
                    if (buyRequirements.every(Boolean))
                        return [2 /*return*/, this.generateSignal(true, "buy")]; // make a buy signal
                }
                return [2 /*return*/, this.generateSignal(false, "none")]; //if no signal
            });
        });
    };
    //get take profit and stoploss
    Swing1h.prototype.getTakeProfitAndStopLoss = function (type) {
        return _super.prototype.getTakeProfitAndStopLoss.call(this, type, 3.3); // default method ex: {tp:20.11,sl:30.11}
    };
    Swing1h.prototype.getPositionSize = function () {
        return _super.prototype.getPositionSize.call(this); // default method ex: 12.30
    };
    Swing1h.prototype.exitAfterCandles = function () {
        return -150;
    };
    return Swing1h;
}(Strategy_1.StrategyBaseSimplified));
exports.Swing1h = Swing1h;
// ============== end 1h ============== //
