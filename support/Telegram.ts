const Telegram = require('node-telegram-bot-api');
export class MoonChatBot{
    private static TelegramStoredChatId:any = process.env.TELEGRAM_TRADE_NOTIFICATION_CHAT_ID;
    private static TelegramStoredChannelId:any = process.env.TELEGRAM_ALIVE_NOTIFICATION_CHAT_ID;
    private static TelegramAPI = new Telegram(process.env.TELEGRAM_BOT_API_KEY+":"+process.env.TELEGRAM_BOT_API_SECRET, { polling: true });
    static sendMessage(message:string){
        this.TelegramAPI.sendMessage(this.TelegramStoredChannelId, message);
    }
    static sendPersonalMessage(message:string,chatId:string=this.TelegramStoredChatId){
        this.TelegramAPI.sendMessage(chatId, message);
    }
    static getBot(){
        return this.TelegramAPI;
    }
} 