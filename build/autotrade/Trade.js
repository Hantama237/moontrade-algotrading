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
exports.AutoTrade = exports.Trade = void 0;
var Binance_1 = require("../support/Binance");
var telegram_1 = require("../support/telegram");
var Trade = /** @class */ (function () {
    function Trade() {
    }
    Trade.updatePosition = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, Binance_1.Binance.getPosition()];
                    case 1:
                        _a.position = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Trade.updateBalance = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, Binance_1.Binance.getBalance()];
                    case 1:
                        _a.balance = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Trade.getPosition = function () {
        return this.position;
    };
    Trade.getBalance = function () {
        return this.balance;
    };
    Trade.entry = function (type, strategy) {
        return __awaiter(this, void 0, void 0, function () {
            var TPandSL, quantity, trade, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        TPandSL = strategy.getTakeProfitAndStopLoss(type);
                        quantity = strategy.getPositionSize();
                        return [4 /*yield*/, Binance_1.Binance.setPositionWithTPSL({
                                type: type,
                                quantity: quantity,
                                slPrice: TPandSL.sl,
                                tpPrice: TPandSL.tp
                            })];
                    case 1:
                        trade = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _a.sent();
                        // await Binance.closeAllPosition();
                        return [4 /*yield*/, Binance_1.Binance.cancelAllOrders()];
                    case 3:
                        // await Binance.closeAllPosition();
                        _a.sent();
                        console.log(error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, true];
                }
            });
        });
    };
    Trade.entryLimit = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var trade, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, Binance_1.Binance.setLimitPosition(entry.type, parseFloat(entry.size), entry.entryPrice)];
                    case 1:
                        trade = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        error_2 = _a.sent();
                        return [4 /*yield*/, Binance_1.Binance.cancelAllOrders()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Trade.setLimitTPSL = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var orders, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, Binance_1.Binance.setLimitTPSL({ "quantity": entry.size, "slPrice": entry.sl, "tpPrice": entry.tp, "type": entry.type })];
                    case 1:
                        orders = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        error_3 = _a.sent();
                        return [4 /*yield*/, Binance_1.Binance.cancelAllOrders()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Trade;
}());
exports.Trade = Trade;
var AutoTrade = /** @class */ (function () {
    function AutoTrade() {
    }
    AutoTrade.checkPosition = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Trade.updatePosition()];
                    case 1:
                        _a.sent();
                        result = Trade.getPosition();
                        this.position = result.trade;
                        telegram_1.MoonChatBot.sendMessage("=== " + (Math.abs(result.ammount) > 0 ? "Open" : "Close") + " Position ==\nPosition Size : " + result.ammount + "\nPrice : " + result.price);
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoTrade.runStrategy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.position && this.entry == null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.checkPosition()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 13];
                    case 2:
                        if (!(this.entry != null && this.entry.entry)) return [3 /*break*/, 4];
                        this.timePassed++;
                        if (!(this.timePassed == 1)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.checkPosition()];
                    case 3:
                        _a.sent();
                        if (this.position) {
                            Trade.setLimitTPSL(this.entry);
                        }
                        else {
                            this.entry = null;
                            this.timePassed = 0;
                        }
                        _a.label = 4;
                    case 4: return [4 /*yield*/, this.strategy.updateData(this.allCandlesData)];
                    case 5:
                        result = _a.sent();
                        if (!result.entry) return [3 /*break*/, 12];
                        telegram_1.MoonChatBot.sendMessage(result.message);
                        if (!(this.orderType == "MARKET")) return [3 /*break*/, 8];
                        return [4 /*yield*/, Trade.entry(result.type, this.strategy)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.checkPosition()];
                    case 7:
                        _a.sent();
                        if (!this.position) {
                            this.webSocket.close();
                            telegram_1.MoonChatBot.sendMessage("Position Not Detected! restarting.");
                        }
                        return [3 /*break*/, 11];
                    case 8:
                        this.entry = result;
                        this.timePassed = 0;
                        return [4 /*yield*/, Trade.entryLimit(result)];
                    case 9:
                        _a.sent();
                        telegram_1.MoonChatBot.sendMessage("Order submitted");
                        return [4 /*yield*/, this.checkPosition()];
                    case 10:
                        _a.sent();
                        if (this.position) {
                            Trade.setLimitTPSL(result);
                        }
                        _a.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        telegram_1.MoonChatBot.sendPersonalMessage(result.message);
                        _a.label = 13;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    AutoTrade.loadCandlesData = function (timeframe) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.allCandlesData;
                        _b = timeframe;
                        return [4 /*yield*/, Binance_1.Binance.getFuturesCandles(timeframe)];
                    case 1:
                        _a[_b] = _c.sent();
                        this.allCandlesData[timeframe].pop(); //remove last open candle
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoTrade.streamListener = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var parsed, _i, _a, timeframe;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        parsed = (0, Binance_1.parseData)(data);
                        if (!parsed.isClosed) return [3 /*break*/, 6];
                        AutoTrade.allCandlesData[AutoTrade.strategy.mainTimeframe].push(parsed.data);
                        _i = 0, _a = AutoTrade.strategy.otherTimeframe;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        timeframe = _a[_i];
                        return [4 /*yield*/, AutoTrade.loadCandlesData(timeframe)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (AutoTrade.allCandlesData[AutoTrade.strategy.mainTimeframe].length == 550) {
                            AutoTrade.allCandlesData[(AutoTrade.strategy.mainTimeframe)].splice(0, 50);
                        }
                        ;
                        return [4 /*yield*/, AutoTrade.runStrategy()];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    AutoTrade.startListener = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_4;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = this;
                        return [4 /*yield*/, Binance_1.Binance.subscribeFuturesCandles(this.streamListener, this.strategy.mainTimeframe)];
                    case 1:
                        _a.webSocket = _b.sent();
                        this.webSocket.on('close', function () {
                            telegram_1.MoonChatBot.sendMessage("Socket Closed!");
                            telegram_1.MoonChatBot.sendMessage("Trade stopped");
                            setTimeout(function () {
                                _this.start();
                            }, 3000);
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        telegram_1.MoonChatBot.sendMessage(error_4.toString());
                        telegram_1.MoonChatBot.sendMessage("Trade stopped");
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AutoTrade.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, timeframe;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isStopped)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.checkPosition()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.loadCandlesData(this.strategy.mainTimeframe)];
                    case 2:
                        _b.sent();
                        _i = 0, _a = this.strategy.otherTimeframe;
                        _b.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        timeframe = _a[_i];
                        return [4 /*yield*/, this.loadCandlesData(timeframe)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        telegram_1.MoonChatBot.sendMessage("Trade started");
                        return [4 /*yield*/, this.runStrategy()];
                    case 7:
                        _b.sent();
                        this.startListener();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoTrade.terminate = function () {
        this.webSocket.terminate();
    };
    AutoTrade.orderType = "MARKET";
    AutoTrade.allCandlesData = {};
    AutoTrade.position = false;
    AutoTrade.entry = null;
    AutoTrade.timePassed = 0;
    AutoTrade.isStopped = false;
    return AutoTrade;
}());
exports.AutoTrade = AutoTrade;
