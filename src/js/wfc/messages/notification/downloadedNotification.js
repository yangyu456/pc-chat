import NotificationMessageContent from './notificationMessageContent'
export default class DownloadedNotification extends NotificationMessageContent {
    tip = '';

    constructor(type) {
        super(type)
        this.tip = '对方接收了文件';
    }

    formatNotification() {
        return this.tip;
    }

    digest() {
        return this.tip;
    }

    encode() {
        let payload = super.encode();
        payload.content = this.tip;
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.tip = payload.content;
    }
}
