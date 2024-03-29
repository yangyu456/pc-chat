import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { ipcRenderer } from "electron";
import axios from "axios";
import clazz from "classname";

import classes from "./style.css";
import Loader from "components/Loader";
import Chats from "./Chats";
import ChatContent from "./ChatContent";
import wfc from "../../../wfc/client/wfc";
import EventType from "../../../wfc/client/wfcEvent";
import Push from "push.js";
import MessageConfig from "../../../wfc/client/messageConfig";
import PersistFlag from "../../../wfc/messages/persistFlag";
import { isElectron } from "../../../platform";
import Config from "../../../config";

@inject((stores) => ({
    loading: stores.sessions.loading,
    showConversation: stores.chat.showConversation,
    toggleConversation: stores.chat.toggleConversation,
    showRedIcon: stores.settings.showRedIcon,
    chatTo: stores.chat.chatToN,
    newChat: () => stores.newchat.toggle(true),
}))
@observer
export default class Home extends Component {
    // 模块渲染后
    componentDidMount() {
        // 切换到对话
        this.props.toggleConversation(true);
        if (!isElectron()) {
            wfc.eventEmitter.on(
                EventType.ReceiveMessage,
                // 触发新消息
                this.onReceiveMessage
            );
        }

        axios.defaults.baseURL = Config.APP_SERVER;
        // 提醒内容
        this.getRemindInfo();
        // ipcRenderer.on("get-remindinfo-reply", (event, arg) => {
        //     console.log("渲染进程" + arg);
        // });
    }

    async getRemindInfo() {
        var response = await axios.post("/getRemindCounts", {
            username: wfc.getUserInfo(wfc.getUserId()).name,
        });
        console.log("---------- getRemindCounts", response.data);
        if (response.data) {
            switch (response.data.code) {
                case 0:
                    let counts = response.data.result.counts;
                    let url = response.data.result.url;

                    ipcRenderer.send("get-remindinfo", {
                        counts: counts,
                        url: url,
                    });

                    break;
                default:
                    break;
            }
        }
    }

    componentWillUnmount() {
        if (!isElectron()) {
            wfc.eventEmitter.removeListener(
                EventType.ReceiveMessage,
                this.onReceiveMessage
            );
        }
    }
    // 收到新消息
    onReceiveMessage = (msg) => {
        let chatTo = this.props.chatTo;
        // 收到新消息触发图标闪烁
        // let returnFlashing = ipcRenderer.send("flashingIcon");

        if (document.hidden) {
            let content = msg.messageContent;
            if (
                MessageConfig.getMessageContentPersitFlag(content.type) ===
                PersistFlag.Persist_And_Count
            ) {
                Push.create("新消息来了", {
                    // 返回摘要，作为二进制数据字符串值
                    body: content.digest(),
                    icon: "../../../../assets/images/icon.png",
                    timeout: 4000,
                    onClick: function () {
                        // 点击的时候获取焦点，关闭窗口发消息
                        window.focus();
                        this.close();
                        chatTo(msg.conversation);
                    },
                });
            }
        }
    };

    render() {
        return (
            <div className={classes.container}>
                <Loader fullscreen={true} show={false} />
                <div
                    className={clazz(classes.inner, {
                        [classes.hideConversation]: !this.props
                            .showConversation,
                    })}
                >
                    <div className={classes.left}>
                        <Chats />

                        {this.props.showRedIcon && (
                            <div
                                className={classes.addChat}
                                onClick={() => this.props.newChat()}
                            >
                                <i className="icon-ion-android-add" />
                            </div>
                        )}
                    </div>

                    <div className={classes.right}>
                        <ChatContent />
                    </div>
                </div>
            </div>
        );
    }
}
