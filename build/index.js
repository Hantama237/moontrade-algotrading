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
var Strategy5m_1 = require("./strategy/Strategy5m");
var Binance_1 = require("./support/Binance");
var telegram_1 = require("./support/telegram");
var Trade_1 = require("./support/Trade");
var webSocket;
var isStopped = false;
//Strategy
var strategy = new Strategy5m_1.Strategy5mV2Psar();
var position = false;
//ALL candles
var allCandlesData = {};
var mainTimeframe = strategy.mainTimeframe;
var otherTimeframe = strategy.otherTimeframe;
function checkPosition() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Trade_1.Trade.updatePosition()];
                case 1:
                    _a.sent();
                    result = Trade_1.Trade.getPosition();
                    position = result.trade;
                    telegram_1.MoonChatBot.sendMessage("=== " + (Math.abs(result.ammount) > 0 ? "Open" : "Close") + " Position ==\nPosition Size : " + result.ammount + "\nPrice : " + result.price);
                    return [2 /*return*/];
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
                    if (!position) return [3 /*break*/, 2];
                    return [4 /*yield*/, checkPosition()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 2: return [4 /*yield*/, strategy.updateData(allCandlesData)];
                case 3:
                    result = _a.sent();
                    if (!result.entry) return [3 /*break*/, 6];
                    telegram_1.MoonChatBot.sendMessage(result.message);
                    return [4 /*yield*/, Trade_1.Trade.entry(result.type, strategy)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, checkPosition()];
                case 5:
                    _a.sent();
                    if (!position) {
                        webSocket.close();
                        telegram_1.MoonChatBot.sendMessage("Position Not Detected! restarting.");
                    }
                    return [3 /*break*/, 7];
                case 6:
                    telegram_1.MoonChatBot.sendPersonalMessage(result.message);
                    _a.label = 7;
                case 7: return [2 /*return*/];
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
        var parsed, _i, otherTimeframe_1, e;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parsed = (0, Binance_1.parseData)(data);
                    if (!parsed.isClosed) return [3 /*break*/, 6];
                    allCandlesData[mainTimeframe].push(parsed.data);
                    _i = 0, otherTimeframe_1 = otherTimeframe;
                    _a.label = 1;
                case 1:
                    if (!(_i < otherTimeframe_1.length)) return [3 /*break*/, 4];
                    e = otherTimeframe_1[_i];
                    return [4 /*yield*/, loadCandlesData(e)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [4 /*yield*/, runStrategy()];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
function startListener() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Binance_1.Binance.subscribeFuturesCandles(streamListener, mainTimeframe)];
                case 1:
                    webSocket = _a.sent();
                    webSocket.on('close', function () {
                        telegram_1.MoonChatBot.sendMessage("Socket Closed!");
                        telegram_1.MoonChatBot.sendMessage("Trade stopped");
                        setTimeout(function () {
                            main();
                        }, 3000);
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    telegram_1.MoonChatBot.sendMessage(error_1.toString());
                    telegram_1.MoonChatBot.sendMessage("Trade stopped");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, otherTimeframe_2, e;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isStopped)
                        return [2 /*return*/];
                    //TRADE
                    return [4 /*yield*/, checkPosition()];
                case 1:
                    //TRADE
                    _a.sent();
                    //STREAM
                    return [4 /*yield*/, loadCandlesData(mainTimeframe)];
                case 2:
                    //STREAM
                    _a.sent();
                    _i = 0, otherTimeframe_2 = otherTimeframe;
                    _a.label = 3;
                case 3:
                    if (!(_i < otherTimeframe_2.length)) return [3 /*break*/, 6];
                    e = otherTimeframe_2[_i];
                    return [4 /*yield*/, loadCandlesData(e)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    telegram_1.MoonChatBot.sendMessage("Trade started");
                    return [4 /*yield*/, runStrategy()];
                case 7:
                    _a.sent();
                    startListener();
                    return [2 /*return*/];
            }
        });
    });
}
telegram_1.MoonChatBot.getBot().onText(/\/trade (.+)/, function (msg, match) {
    var chatId = msg.chat.id;
    var resp = match[1]; // the captured "whatever"
    if (match[1] == "start" && isStopped) {
        isStopped = false;
        main();
        telegram_1.MoonChatBot.sendPersonalMessage(chatId, "Starting Trade!");
    }
    else if (match[1] == "stop" && !isStopped) {
        isStopped = true;
        webSocket.terminate();
        telegram_1.MoonChatBot.sendPersonalMessage(chatId, "Stopping Trade!");
    }
});
main();
