import React, { Component } from "react";
import { inject } from "mobx-react";

import MessageInput from "components/MessageInput";

@inject((stores) => ({
    sendMessage: stores.chat.sendMessage,
    conversation: stores.chat.conversation,
    target: stores.chat.target,
    showMessage: stores.snackbar.showMessage,
    me: stores.sessions.user,
    // 方法
    HistData: stores.chat.HistData,
    confirmSendImage: async (image) => {
        if (!stores.settings.confirmImagePaste) {
            return true;
        }

        var confirmed = await stores.confirmImagePaste.toggle(true, image);
        return confirmed;
    },
    process: stores.chat.process,
    updateQuickSend: stores.chat.updateQuickSend,
    initQuickSend: stores.chat.initQuickSend,
    quickSendList: stores.chat.quickSendList,
    // 数据
    HistDate: stores.chat.Hist,
    getHistoryList: stores.chat.getHistoryList,
    searchHistory: stores.chat.searchHistory,
    searchingText: stores.chat.searchingText,
}))
export default class Message extends Component {
    render() {
        var {
            sendMessage,
            showMessage,
            me = {},
            confirmSendImage,
            process,
            conversation,
            target,
            updateQuickSend,
            initQuickSend,
            quickSendList,
            HistDate,
            HistData,
            getHistoryList,
            searchHistory,
            searchingText,
        } = this.props;

        return (
            <MessageInput
                {...{
                    sendMessage,
                    showMessage,
                    me: me.User,
                    confirmSendImage,
                    process,
                    conversation,
                    target,
                    updateQuickSend,
                    initQuickSend,
                    quickSendList,
                    HistDate,
                    HistData,
                    getHistoryList,
                    searchHistory,
                    searchingText,
                }}
            />
        );
    }
}
