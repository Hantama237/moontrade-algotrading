"use strict";
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
exports.separateOHLCtoIndividualArray = exports.parseData = exports.Binance = void 0;
require("dotenv/config");
var BinanceAPI = require('node-binance-api');
var Binance = /** @class */ (function () {
    function Binance() {
    }
    // Intervals: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
    Binance.getFuturesCandles = function (timeframe, symbol, limit) {
        if (timeframe === void 0) { timeframe = "5m"; }
        if (symbol === void 0) { symbol = "LTCUSDT"; }
        if (limit === void 0) { limit = 500; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.binance.futuresCandles(symbol, timeframe, { limit: limit })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Binance.subscribeFuturesCandles = function (processFunction, timeframe, symbol) {
        if (timeframe === void 0) { timeframe = "5m"; }
        if (symbol === void 0) { symbol = "ltcusdt"; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.binance.futuresSubscribe(symbol + '@kline_' + timeframe, processFunction)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Binance.getBalance = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, balance, _i, response_1, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.binance.futuresBalance({ asset: "LTCUSDT", recvWindow: 100000000 })];
                    case 1:
                        response = _a.sent();
                        balance = {};
                        for (_i = 0, response_1 = response; _i < response_1.length; _i++) {
                            i = response_1[_i];
                            balance[i.asset] = i.balance;
                        }
                        console.log(balance);
                        return [2 /*return*/, balance];
                }
            });
        });
    };
    Binance.getPosition = function (symbol) {
        if (symbol === void 0) { symbol = "LTCUSDT"; }
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.binance.futuresPositionRisk({ symbol: symbol, recvWindow: 100000000 })];
                    case 1:
                        response = _a.sent();
                        console.log(response);
                        return [2 /*return*/, {
                                "trade": Math.abs(response[0].positionAmt) > 0,
                                "ammount": response[0].positionAmt,
                                "price": response[0].entryPrice
                            }];
                }
            });
        });
    };
    Binance.getOrders = function (symbol) {
        if (symbol === void 0) { symbol = "LTCUSDT"; }
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.binance.futuresOpenOrders(symbol, { recvWindow: 100000000 })];
                    case 1:
                        response = _a.sent();
                        console.log(response);
                        return [2 /*return*/, response];
                }
            });
        });
    };
    Binance.cancelAllOrders = function (symbol) {
        if (symbol === void 0) { symbol = "LTCUSDT"; }
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.binance.futuresCancelAll(symbol)];
                    case 1:
                        response = _a.sent();
                        console.log(response);
                        return [2 /*return*/, response];
                }
            });
        });
    };
    Binance.setPositionWithTPSL = function (params) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.binance.futuresMultipleOrders([
                            {
                                'newClientOrderId': '467fba09-a286-43c3-a79a-' + (Math.random() + 1).toString(36).substring(7),
                                'symbol': (_a = params.symbol) !== null && _a !== void 0 ? _a : "LTCUSDT",
                                'type': 'MARKET',
                                'quantity': params.quantity,
                                'side': (params.type == "sell" ? "SELL" : "BUY")
                            },
                            {
                                'newClientOrderId': '6925e0cb-2d86-42af-875c-' + (Math.random() + 1).toString(36).substring(7),
                                'symbol': (_b = params.symbol) !== null && _b !== void 0 ? _b : "LTCUSDT",
                                'type': 'STOP_MARKET',
                                'quantity': params.quantity,
                                'side': (params.type == "sell" ? "BUY" : "SELL"),
                                'stopPrice': params.slPrice.toString(),
                                'timeInForce': 'GTE_GTC',
                                'reduceOnly': 'True'
                            },
                            {
                                'newClientOrderId': '6925e0cb-2d86-42af-875c-' + (Math.random() + 1).toString(36).substring(7),
                                'symbol': (_c = params.symbol) !== null && _c !== void 0 ? _c : "LTCUSDT",
                                'type': 'TAKE_PROFIT_MARKET',
                                'quantity': params.quantity,
                                'side': (params.type == "sell" ? "BUY" : "SELL"),
                                'stopPrice': params.tpPrice.toString(),
                                'timeInForce': 'GTE_GTC',
                                'reduceOnly': 'True'
                            }
                        ])];
                    case 1:
                        response = _d.sent();
                        console.log(response);
                        return [2 /*return*/, response];
                }
            });
        });
    };
    Binance.getHistoricalData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = console).info;
                        return [4 /*yield*/, this.binance.futuresHistDataId("LTCUSDT", {
                                startTime: new Date().getTime() - 24 * 60 * 60 * 1000,
                                endTime: new Date().getTime(),
                                dataType: 'T_TRADE'
                            })];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/];
                }
            });
        });
    };
    Binance.getDownloadLink = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = console).info;
                        return [4 /*yield*/, this.binance.futuresDownloadLink(547804)];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/];
                }
            });
        });
    };
    Binance.binance = new BinanceAPI().options({
        'APIKEY': process.env.API_KEY,
        'APISECRET': process.env.API_SECRET,
        'test': false
    });
    return Binance;
}());
exports.Binance = Binance;
function parseData(data) {
    var temp = [
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
            "isClosed": true,
            "data": temp
        };
    }
    else {
        return {
            "isClosed": false,
            "data": temp
        };
    }
}
exports.parseData = parseData;
function separateOHLCtoIndividualArray(data) {
    var open = [];
    var high = [];
    var low = [];
    var close = [];
    data.forEach(function (element) {
        open.push(parseFloat(element[1]));
        high.push(parseFloat(element[2]));
        low.push(parseFloat(element[3]));
        close.push(parseFloat(element[4]));
    });
    return {
        "open": open,
        "high": high,
        "low": low,
        "close": close
    };
}
exports.separateOHLCtoIndividualArray = separateOHLCtoIndividualArray;
