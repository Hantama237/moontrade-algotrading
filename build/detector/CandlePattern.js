"use strict";
exports.__esModule = true;
exports.CandlePattern = void 0;
var CandlePattern = /** @class */ (function () {
    function CandlePattern() {
    }
    CandlePattern.bodyLen = function (data) {
        return Math.abs(data.open - data.close);
    };
    CandlePattern.wickLen = function (data) {
        return data.high - Math.max(data.open, data.close);
    };
    CandlePattern.tailLen = function (data) {
        return Math.min(data.open, data.close) - data.low;
    };
    CandlePattern.isBullish = function (data) {
        return data.open < data.close;
    };
    CandlePattern.isBearish = function (data) {
        return data.open > data.close;
    };
    CandlePattern.isDoji = function (data) {
        return Math.abs(data.close - data.open) / (data.high - data.low) < 0.1 &&
            (data.high - Math.max(data.close, data.open)) > (3 * Math.abs(data.close - data.open)) &&
            (Math.min(data.close, data.open) - data.low) > (3 * Math.abs(data.close - data.open));
    };
    CandlePattern.isHammer = function (data, inverted) {
        if (inverted === void 0) { inverted = false; }
        if (inverted) {
            return (((data.high - data.low) > 3 * (data.open - data.close)) &&
                ((data.high - data.close) / (.001 + data.high - data.low) > 0.6) &&
                ((data.high - data.open) / (.001 + data.high - data.low) > 0.6));
        }
        return (((data.high - data.low) > 3 * (data.open - data.close)) &&
            ((data.close - data.low) / (.001 + data.high - data.low) > 0.6) &&
            ((data.open - data.low) / (.001 + data.high - data.low) > 0.6));
    };
    CandlePattern.isEngulfing = function (prev, current, inverted) {
        if (inverted === void 0) { inverted = false; }
        return !inverted ? (current.close >= prev.open && prev.open > prev.close &&
            current.close > current.open &&
            prev.close >= current.open &&
            current.close - current.open > prev.open - prev.close) :
            (current.open >= prev.close && prev.close > prev.open &&
                current.open > current.close &&
                prev.open >= current.close &&
                current.open - current.close > prev.close - prev.open);
    };
    CandlePattern.isCloseOverPrevious = function (prev, current, reversed) {
        if (reversed === void 0) { reversed = false; }
        return reversed ? (current.close < prev.low) : (current.close > prev.high);
    };
    CandlePattern.isLongTail = function (data, reversed) {
        if (reversed === void 0) { reversed = false; }
        return (reversed ? (this.wickLen(data) > this.tailLen(data)) : (this.wickLen(data) < this.tailLen(data)));
    };
    CandlePattern.crossover = function (prev1, prev2, curr1, curr2, reversed) {
        if (reversed === void 0) { reversed = false; }
        if (!reversed)
            return (prev1 <= prev2 && curr1 > curr2);
        else
            return ((prev1 >= prev2 && curr1 < curr2));
    };
    return CandlePattern;
}());
exports.CandlePattern = CandlePattern;
