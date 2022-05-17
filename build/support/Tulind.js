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
exports.Tulind = void 0;
var TA = require('tulind');
var TAJS = require('ta.js');
//const TALIB = require('technicalindicators');
var Tulind = /** @class */ (function () {
    function Tulind() {
    }
    Tulind.convertData = function (input) {
        var data = [];
        for (var i = 0; i < input[0].length; i++) {
            var temp = [];
            if (input[0]) {
                temp.push(input[0][i]);
            }
            if (input[1]) {
                temp.push(input[1][i]);
            }
            if (input[2]) {
                temp.push(input[2][i]);
            }
            data.push(temp);
        }
        return data;
    };
    Tulind.fillEmptyData = function (input, length) {
        var result = input;
        for (; input.length < length;) {
            result.unshift(null);
        }
        return result;
    };
    Tulind.getATR = function (length, high, low, close) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TAJS.atr(this.convertData([high, low, close]), length)];
                    case 1:
                        result = _a.sent();
                        result = this.fillEmptyData(result, high.length);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Tulind.getEMA = function (length, data) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TAJS.ema(data, length)];
                    case 1:
                        result = _a.sent();
                        result = this.fillEmptyData(result, data.length);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Tulind.getRSI = function (length, data) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TAJS.rsi(data, length)];
                    case 1:
                        result = _a.sent();
                        result = this.fillEmptyData(result, data.length);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Tulind.getPSAR = function (high, low, step, max) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TAJS.psar(this.convertData([high, low]), step, max)];
                    case 1:
                        result = _a.sent();
                        result = this.fillEmptyData(result, high.length);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Tulind.getBB = function (length, multiplier, data) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TAJS.bands(data, length, multiplier)];
                    case 1:
                        result = _a.sent();
                        result = this.fillEmptyData(result, data.length);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Tulind.getMACD = function (short, long, signal, data) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                result = [];
                TA.indicators.macd.indicator([data], [short, long, signal], function (err, results) {
                    result.push(results[0]);
                    result.push(results[1]);
                    result.push(results[2]);
                });
                return [2 /*return*/, result];
            });
        });
    };
    Tulind.getKC = function (length, multiplier, high, close, low) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TAJS.keltner(this.convertData([high, close, low]), length, multiplier)];
                    case 1:
                        result = _a.sent();
                        result = this.fillEmptyData(result, high.length);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Tulind.getTA = function () {
        return TA;
    };
    Tulind.highest = function (data, currentIndex, length) {
        var highest = 0;
        for (var i = currentIndex; i > currentIndex - length; i--) {
            if (data[i] > highest)
                highest = data[i];
        }
        return highest;
    };
    Tulind.lowest = function (data, currentIndex, length) {
        var lowest = 100000000;
        for (var i = currentIndex; i > currentIndex - length; i--) {
            if (data[i] < lowest)
                lowest = data[i];
        }
        return lowest;
    };
    Tulind.roundNumber = function (num, dec) {
        return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    };
    Tulind.getChandelierExit = function (length, multiplier, high, close, low, precision) {
        if (precision === void 0) { precision = 2; }
        return __awaiter(this, void 0, void 0, function () {
            var atr, chandelierExitLong, chandelierExitShort, directions, i, longStop, longStopPrev, shortStop, shortStopPrev, dir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getATROld(length, high, low, close)];
                    case 1:
                        atr = _a.sent();
                        chandelierExitLong = [];
                        chandelierExitShort = [];
                        directions = [];
                        for (i = length - 1; i < atr.length; i++) {
                            longStop = this.highest(close, i, length) - this.roundNumber(atr[i], precision) * multiplier;
                            longStop = this.roundNumber(longStop, precision);
                            longStopPrev = chandelierExitLong.length > 0 ? chandelierExitLong[chandelierExitLong.length - 1] : longStop;
                            shortStop = this.lowest(close, i, length) + this.roundNumber(atr[i], precision) * multiplier;
                            shortStop = this.roundNumber(shortStop, precision);
                            shortStopPrev = chandelierExitShort.length > 0 ? chandelierExitShort[chandelierExitShort.length - 1] : shortStop;
                            //shortStop = close[i-1] < shortStopPrev ? Math.min(shortStop, shortStopPrev) : shortStop;
                            chandelierExitLong.push(longStop);
                            chandelierExitShort.push(shortStop);
                            dir = 1;
                            dir = close[i] > shortStopPrev ? 1 : close[i] < longStopPrev ? -1 : dir;
                            directions.push(dir);
                        }
                        return [4 /*yield*/, this.fillEmptyData(chandelierExitLong, high.length)];
                    case 2:
                        chandelierExitLong = _a.sent();
                        return [4 /*yield*/, this.fillEmptyData(chandelierExitShort, high.length)];
                    case 3:
                        chandelierExitShort = _a.sent();
                        directions = this.fillEmptyData(directions, high.length);
                        return [2 /*return*/, [chandelierExitLong, chandelierExitShort, directions]];
                }
            });
        });
    };
    // ================== PREV function =============
    Tulind.atrOld = function (data, length) {
        if (length === void 0) { length = 14; }
        for (var i = 1, atr = [data[0][0] - data[0][2]]; i < data.length; i++) {
            var t0 = Math.max((data[i][0] - data[i - 1][1]), (data[i][2] - data[i - 1][1]), (data[i][0] - data[i][2]));
            atr.push((atr[atr.length - 1] * (length - 1) + t0) / length);
        }
        return atr;
    };
    Tulind.getEMAOld = function (length, data) {
        var result = [];
        TA.indicators.ema.indicator([data], [length], function (err, results) {
            result = results[0];
        });
        return result;
    };
    Tulind.getSMMAOld = function (length, data) {
        for (var i = length, smma = []; i <= data.length; i++) {
            var pl = data.slice(i - length, i), average = 0;
            for (var q in pl)
                average += pl[q];
            if (smma.length <= 0) {
                smma.push(average / length);
            }
            else {
                smma.push((average - smma[smma.length - 1]) / length);
            }
        }
        smma.splice(0, 1);
        return smma;
    };
    Tulind.getBBOld = function (length, multiplier, data) {
        var result = [];
        TA.indicators.bbands.indicator([data], [length, multiplier], function (err, results) {
            result.push(results[0]);
            result.push(results[2]);
        });
        return result;
    };
    Tulind.getATROld = function (length, high, low, close) {
        var data = [];
        for (var i = 0; i < high.length; i++) {
            var temp = [];
            temp.push(high[i]);
            temp.push(close[i]);
            temp.push(low[i]);
            data.push(temp);
        }
        return this.atrOld(data, length);
    };
    Tulind.getMACDOld = function (short, long, signal, data) {
        var result = [];
        TA.indicators.macd.indicator([data], [short, long, signal], function (err, results) {
            result.push(results[0]);
            result.push(results[1]);
            result.push(results[2]);
        });
        return result;
    };
    Tulind.getPSAROld = function (high, low, step, max) {
        var result = [];
        TA.indicators.psar.indicator([high, low], [step, max], function (err, results) {
            result = results[0];
        });
        return result;
        // let data:Array<Array<number>> = [];
        // for(let i=0;i<high.length;i++){
        //     let temp = [];
        //     temp.push(high[i]);
        //     temp.push(low[i]);
        //     data.push(temp);
        // }
        // let furthest = data[0], up = true, accel = step, prev = data[0],
        // sar = data[0][1], extreme = data[0][0], final = [sar];
        // for(let i = 1; i < data.length; i++) {
        //     sar = sar + accel * (extreme - sar);
        //     if(up) {
        //     sar = Math.min(sar, furthest[1], prev[1]);
        //     if(data[i][0] > extreme) {
        //         extreme = data[i][0];
        //         accel = Math.min(accel+step, max);
        //     }
        //     } else {
        //     sar = Math.max(sar, furthest[0], prev[0]);
        //     if(data[i][1] < extreme) {
        //         extreme = data[i][0];
        //         accel = Math.min(accel + step, max);
        //     }
        //     }
        //     if((up && data[i][1] < sar) || (!up && data[i][0] > sar)) {
        //     accel = step;
        //     sar = extreme;
        //     up = !up;
        //     extreme = !up ? data[i][1] : data[i][0]
        //     }
        //     furthest = prev;
        //     prev = data[i];
        //     final.push(sar);
        // }
        // return final;
    };
    return Tulind;
}());
exports.Tulind = Tulind;
//console.log(TA.indicators); 
