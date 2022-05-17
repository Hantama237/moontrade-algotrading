const Telegram = require('node-telegram-bot-api');
export class MoonChatBot{
    private static TelegramStoredChatId:string = "1365494233";
    private static TelegramStoredChannelId:string = "-1001590574256";
    private static TelegramAPI = new Telegram("1704721857:AAERBOsRHczhD308G0XCVeWn6xqN8vWNI8s", { polling: true });
    static sendMessage(message:string){
        this.TelegramAPI.sendMessage(this.TelegramStoredChannelId, message);
    }
    static sendPersonalMessage(message:string,chatId:string="1365494233"){
        this.TelegramAPI.sendMessage(chatId, message);
    }
    static getBot(){
        return this.TelegramAPI;
    }
} 