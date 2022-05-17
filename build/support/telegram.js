"use strict";
exports.__esModule = true;
exports.MoonChatBot = void 0;
var Telegram = require('node-telegram-bot-api');
var MoonChatBot = /** @class */ (function () {
    function MoonChatBot() {
    }
    MoonChatBot.sendMessage = function (message) {
        this.TelegramAPI.sendMessage(this.TelegramStoredChannelId, message);
    };
    MoonChatBot.sendPersonalMessage = function (message, chatId) {
        if (chatId === void 0) { chatId = "1365494233"; }
        this.TelegramAPI.sendMessage(chatId, message);
    };
    MoonChatBot.getBot = function () {
        return this.TelegramAPI;
    };
    MoonChatBot.TelegramStoredChatId = "1365494233";
    MoonChatBot.TelegramStoredChannelId = "-1001590574256";
    MoonChatBot.TelegramAPI = new Telegram("1704721857:AAERBOsRHczhD308G0XCVeWn6xqN8vWNI8s", { polling: true });
    return MoonChatBot;
}());
exports.MoonChatBot = MoonChatBot;
