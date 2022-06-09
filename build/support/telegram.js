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
        if (chatId === void 0) { chatId = this.TelegramStoredChatId; }
        this.TelegramAPI.sendMessage(chatId, message);
    };
    MoonChatBot.getBot = function () {
        return this.TelegramAPI;
    };
    MoonChatBot.TelegramStoredChatId = process.env.TELEGRAM_TRADE_NOTIFICATION_CHAT_ID;
    MoonChatBot.TelegramStoredChannelId = process.env.TELEGRAM_ALIVE_NOTIFICATION_CHAT_ID;
    MoonChatBot.TelegramAPI = new Telegram(process.env.TELEGRAM_BOT_API_KEY + ":" + process.env.TELEGRAM_BOT_API_SECRET, { polling: true });
    return MoonChatBot;
}());
exports.MoonChatBot = MoonChatBot;
