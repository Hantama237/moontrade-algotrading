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
var __1 = require("..");
var Binance_1 = require("../support/Binance");
var telegram_1 = require("../support/telegram");
var Trade_1 = require("./Trade");
var orderType = __1.TradeConfig.orderType;
var allCandlesData = {};
var webSocket;
var strategy = __1.TradeConfig.strategy;
var position = false;
var entry = null;
var timePassed = 0;
var isStopped = false;
function checkPosition() {
    return __awaiter(this, void 0, void 0, function () {
        var result, positionNotification, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Trade_1.Trade.updatePosition()];
                case 1:
                    _a.sent();
                    result = Trade_1.Trade.getPosition();
                    position = result.trade;
                    positionNotification = "=== " + (Math.abs(result.ammount) > 0 ? "Open" : "Close") + " Position ===\n" +
                        "Position Size : " + result.ammount + "\n" +
                        "Entry Price   : " + result.price + "\n";
                    positionNotification += position ? "Current Price : " + allCandlesData[strategy.mainTimeframe][allCandlesData[strategy.mainTimeframe].length - 1][4] : "";
                    telegram_1.MoonChatBot.sendMessage(positionNotification);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    telegram_1.MoonChatBot.sendMessage("Error Occured!");
                    telegram_1.MoonChatBot.sendMessage(JSON.stringify(error_1));
                    console.log(error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function runStrategy() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(position && entry == null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, checkPosition()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 16];
                case 2:
                    if (!(entry != null && entry.entry)) return [3 /*break*/, 7];
                    timePassed++;
                    if (!(timePassed == 1)) return [3 /*break*/, 7];
                    return [4 /*yield*/, checkPosition()];
                case 3:
                    _a.sent();
                    if (!position) return [3 /*break*/, 5];
                    return [4 /*yield*/, Trade_1.Trade.setLimitTPSL(entry)];
                case 4:
                    _a.sent();
                    entry = null;
                    timePassed = 0;
                    telegram_1.MoonChatBot.sendMessage("TP & SL submitted!");
                    return [3 /*break*/, 7];
                case 5:
                    telegram_1.MoonChatBot.sendMessage("Skipped, limit order not filled!");
                    return [4 /*yield*/, Binance_1.Binance.cancelAllOrders()];
                case 6:
                    _a.sent();
                    entry = null;
                    timePassed = 0;
                    _a.label = 7;
                case 7: return [4 /*yield*/, strategy.updateData(allCandlesData)];
                case 8:
                    result = _a.sent();
                    if (!(result.entry && entry == null && !position)) return [3 /*break*/, 15];
                    telegram_1.MoonChatBot.sendMessage(result.message);
                    if (!(orderType == "MARKET")) return [3 /*break*/, 11];
                    return [4 /*yield*/, Trade_1.Trade.entry(result.type, strategy)];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, checkPosition()];
                case 10:
                    _a.sent();
                    if (!position) {
                        webSocket.close();
                        telegram_1.MoonChatBot.sendMessage("Position Not Detected! restarting.");
                    }
                    return [3 /*break*/, 14];
                case 11:
                    if (!!position) return [3 /*break*/, 14];
                    entry = result;
                    timePassed = 0;
                    return [4 /*yield*/, Trade_1.Trade.entryLimit(result)];
                case 12:
                    _a.sent();
                    telegram_1.MoonChatBot.sendMessage("Order submitted");
                    return [4 /*yield*/, checkPosition()];
                case 13:
                    _a.sent();
                    if (position) {
                        Trade_1.Trade.setLimitTPSL(result);
                        entry = null;
                        timePassed = 0;
                    }
                    _a.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    telegram_1.MoonChatBot.sendPersonalMessage(result.message);
                    _a.label = 16;
                case 16: return [2 /*return*/];
            }
        });
    });
}
function loadCandlesData(timeframe) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = allCandlesData;
                    _b = timeframe;
                    return [4 /*yield*/, Binance_1.Binance.getFuturesCandles(timeframe)];
                case 1:
                    _a[_b] = _c.sent();
                    allCandlesData[timeframe].pop(); //remove last open candle
                    return [2 /*return*/];
            }
        });
    });
}
function streamListener(data) {
    return __awaiter(this, void 0, void 0, function () {
        var parsed, _i, _a, timeframe, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    parsed = (0, Binance_1.parseData)(data);
                    if (!parsed.isClosed) return [3 /*break*/, 6];
                    allCandlesData[strategy.mainTimeframe].push(parsed.data);
                    _i = 0, _a = strategy.otherTimeframe;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    timeframe = _a[_i];
                    return [4 /*yield*/, loadCandlesData(timeframe)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    if (allCandlesData[strategy.mainTimeframe].length == 550) {
                        allCandlesData[(strategy.mainTimeframe)].splice(0, 50);
                    }
                    ;
                    return [4 /*yield*/, runStrategy()];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_2 = _b.sent();
                    telegram_1.MoonChatBot.sendMessage("Error Occured!");
                    telegram_1.MoonChatBot.sendMessage(JSON.stringify(error_2));
                    console.log(error_2);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function startListener() {
    return __awaiter(this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Binance_1.Binance.subscribeFuturesCandles(streamListener, strategy.mainTimeframe)];
                case 1:
                    webSocket = _a.sent();
                    webSocket.on('close', function () {
                        telegram_1.MoonChatBot.sendMessage("Socket Closed!");
                        setTimeout(function () {
                            start();
                        }, 3000);
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    telegram_1.MoonChatBot.sendMessage(JSON.stringify(error_3));
                    telegram_1.MoonChatBot.sendMessage("Trade stopped");
                    console.log(error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function start() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, timeframe, error_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 8, , 9]);
                    if (isStopped)
                        return [2 /*return*/];
                    return [4 /*yield*/, checkPosition()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, loadCandlesData(strategy.mainTimeframe)];
                case 2:
                    _b.sent();
                    _i = 0, _a = strategy.otherTimeframe;
                    _b.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    timeframe = _a[_i];
                    return [4 /*yield*/, loadCandlesData(timeframe)];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    telegram_1.MoonChatBot.sendMessage("Trade started");
                    return [4 /*yield*/, runStrategy()];
                case 7:
                    _b.sent();
                    startListener();
                    return [3 /*break*/, 9];
                case 8:
                    error_4 = _b.sent();
                    telegram_1.MoonChatBot.sendMessage("Error Occured!");
                    telegram_1.MoonChatBot.sendMessage(JSON.stringify(error_4));
                    console.log(error_4);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function terminate() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            webSocket.terminate();
            return [2 /*return*/];
        });
    });
}
try {
    telegram_1.MoonChatBot.getBot().onText(/\/trade (.+)/, function (msg, match) {
        var chatId = msg.chat.id;
        var resp = match[1]; // the captured "whatever"
        if (match[1] == "start" && isStopped) {
            isStopped = false;
            start();
            telegram_1.MoonChatBot.sendPersonalMessage(chatId, "Starting Trade!");
        }
        else if (match[1] == "stop" && !isStopped) {
            isStopped = true;
            terminate();
            telegram_1.MoonChatBot.sendPersonalMessage(chatId, "Stopping Trade!");
        }
    });
}
catch (error) {
    telegram_1.MoonChatBot.sendMessage("Error Occured!");
    telegram_1.MoonChatBot.sendMessage(JSON.stringify(error));
    console.log(error);
}
start();
