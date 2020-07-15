import React, { Component } from "react";
import Popup from "reactjs-popup";
import PropTypes from "prop-types";
import Checkbox from "rc-checkbox";
import { ipcRenderer, isElectron } from "../../../platform";
import clazz from "classname";
import classes from "./style.css";
import Emoji from "./Emoji";
import QuickSend from "./QuickSend";
import QuickSendList from "./QuickSendList";
import Tribute from "tributejs";
import ChatHistory from "./ChatHistory";
import TextMessageContent from "../../../wfc/messages/textMessageContent";
import PTextMessageContent from "../../../wfc/messages/ptextMessageContent";
import ConversationType from "../../../wfc/model/conversationType";
import wfc from "../../../wfc/client/wfc";
import pinyin from "../../han";
import EventType from "../../../wfc/client/wfcEvent";
import GroupInfo from "../../../wfc/model/groupInfo";
import GroupType from "../../../wfc/model/groupType";
import GroupMemberType from "../../../wfc/model/groupMemberType";
import avenginekitProxy from "../../../wfc/av/engine/avenginekitproxy";
import TipNotification from "../../../wfc/messages/notification/tipNotification";
import CheckBox from "rc-checkbox";
// 表情
import Config from "../../../config";
import { parser as emojiParse } from "utils/emoji";
import { inject, observer } from "mobx-react";
import "!style-loader!css-loader!./font/iconfont.css";
// import Hist from "./Hist/hist";
@inject((stores) => ({
    getList: () => {
        var { chat } = stores;
        return chat.quickSendList;
    },
    historyList: () => {
        var { chat } = stores;
        return chat.historyList;
    },
    toggleShake: stores.chat.toggleShake,
}))
@observer
export default class MessageInput extends Component {
    static propTypes = {
        me: PropTypes.object,
        sendMessage: PropTypes.func.isRequired,
        showMessage: PropTypes.func.isRequired,
        // 确认发送图像
        confirmSendImage: PropTypes.func.isRequired,
        // 加工,传值类型的一个检测
        process: PropTypes.func.isRequired,
        conversation: PropTypes.object,
        target: PropTypes.any,
        // 更新自定义快捷发送
        updateQuickSend: PropTypes.func,
        initQuickSend: PropTypes.func,
        quickSendList: PropTypes.array,
        getHistoryList: PropTypes.func,
        searchHistory: PropTypes.func,
        searchingText: PropTypes.string,
        // 历史消息
        // HistDate: PropTypes.object,
        // 方法
        // HistData: PropTypes.func
    };

    static defaultProps = {
        me: {},
    };

    tribute;
    mentions = [];

    initMention(conversation) {
        // TODO group, channel
        console.log("initMention");
        let type = conversation.conversationType;
        if (
            type === ConversationType.Single ||
            type === ConversationType.ChatRoom
        ) {
            return;
        }

        let mentionMenuItems = [];
        let groupInfo = wfc.getGroupInfo(conversation.target);
        let members = wfc.getGroupMembers(conversation.target);
        if (!members) {
            return;
        }
        mentionMenuItems.push({
            key: "所有人",
            value: "@" + conversation.target,
            avatar: groupInfo.portrait,
            searchKey: "所有人" + pinyin.letter("所有人", "", null),
        });
        let userIds = [];
        members.forEach((e) => {
            userIds.push(e.memberId);
        });

        let userInfos = wfc.getUserInfos(userIds, groupInfo.target);
        userInfos.forEach((e) => {
            e.groupDisplayName = wfc.getGroupMemberDisplayNameEx(e);
        });
        userInfos.forEach((e) => {
            mentionMenuItems.push({
                key: e.groupDisplayName,
                value: "@" + e.uid,
                avatar: e.portrait,
                searchKey:
                    e.groupDisplayName +
                    pinyin.letter(e.groupDisplayName, "", null),
            });
        });

        this.tribute = new Tribute({
            // menuContainer: document.getElementById('content'),
            values: mentionMenuItems,
            selectTemplate: (item) => {
                if (typeof item === "undefined") return null;
                // if (this.range.isContentEditable(this.current.element)) {
                //     return '<span contenteditable="false"><a href="http://zurb.com" target="_blank" title="' + item.original.email + '">' + item.original.value + '</a></span>';
                // }
                this.mentions.push({
                    key: item.original.key,
                    value: item.original.value,
                });

                return "@" + item.original.key;
            },
            menuItemTemplate: function (item) {
                return (
                    '<img width="24" height="24" src="' +
                    item.original.avatar +
                    ' "> ' +
                    item.original.key
                );
            },
            lookup: (item) => {
                return item.searchKey;
            },
            menuContainer: document.body,
        });
        this.tribute.attach(document.getElementById("messageInput"));
    }
    // 处理消息
    handleMention(text) {
        let textMessageContent = new TextMessageContent();
        textMessageContent.content = text;
        this.mentions.forEach((e) => {
            if (text.indexOf(e.key) > -1) {
                if (e.value === "@" + this.props.conversation.target) {
                    textMessageContent.mentionedType = 2;
                } else {
                    if (textMessageContent.mentionedType !== 2) {
                        textMessageContent.mentionedType = 1;
                        textMessageContent.mentionedTargets.push(
                            e.value.substring(1)
                        );
                    }
                }
            }
        });

        this.mentions.length = 0;
        return textMessageContent;
    }

    canisend() {
        let target = this.props.target;
        if (target instanceof GroupInfo) {
            let groupInfo = target;
            if (groupInfo.type === GroupType.Restricted) {
                let groupMember = wfc.getGroupMember(
                    groupInfo.target,
                    wfc.getUserId()
                );
                if (
                    groupInfo.mute === 1 &&
                    groupMember.type === GroupMemberType.Normal
                ) {
                    return false;
                }
            }
        }

        if (this.props.conversation) {
            return true;
        }

        return false;
    }
    placeCaretAtEnd(el) {
        el.focus();
        if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
        else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }
    // 当键盘按下的时候触发
    async handleEnter(e) {
        // var message = this.refs.input.value.trim();
        var message = this.refs.input.innerHTML.trim().replace(/&nbsp;/g," ").trim();
        // console.log(message);
        var conversation = this.props.conversation;

        if (!conversation || !this.canisend() || !message || e.charCode !== 13)
            return;

        if (e.ctrlKey && e.charCode === 13) {
            e.preventDefault();
            // this.refs.input.value = this.refs.input.value + "\n";
            this.refs.input.innerHTML = this.refs.input.innerHTML + "<div><br></div>";
            this.placeCaretAtEnd(this.refs.input);
            return;
        }
        // TODO batch
        var batch = conversation.length > 1;

        // You can not send message to yourself
        // await this.props.sendMessage(
        //     new TextMessageContent(message)
        // )

        // TODO 处理表情路径变化
        message = message
            .replace(/<img class="emoji" draggable="false" alt="/g, "")
            .replace(/" src="assets\/twemoji\/72x72\/[0-9a-z-]+\.png">/g, '')
            .replace(
                /" src="https:\/\/twemoji\.maxcdn\.com\/v\/12\.1\.6\/72x72\/[0-9a-z-]+\.png">/g,
                ""
            )
        console.log(message);
        let textMessageContent = this.handleMention(message);
        this.props.sendMessage(textMessageContent);
        this.refs.input.innerHTML = "";
        wfc.setConversationDraft(conversation, "");
        e.preventDefault();
    }

    state = {
        // 是否显示表情
        showEmoji: false,
        // 是否显示快捷发送
        showQuickSend: false,
        //是否显示历史记录
        showHistory: false,
        // showHist:false
        showChatHistory: false,
        // 是否显示快捷发送
        showQuickSendList: false,
    };

    changeQuick(command) {
        this.props.quickSendList.forEach((e, i) => {
            if (command == e.command) {
                this.setState({
                    currentQuickSend: { command: command, message: e.message },
                });
            }
        });
    }

    toggleEmoji(show = !this.state.showEmoji) {
        this.setState({
            showEmoji: show,
            showChatHistory: false,
            showQuickSend: false,
            showQuickSendList: false,
        });
    }

    // 窗口抖屏
    toggShake(e) {
        var conversation = this.props.conversation;
        // 本地缓存一个true
        localStorage.setItem("isWin", true);
        // 为 1 发消息的对话框是群聊
        let groupShake = conversation.type === 1 ? true : false;
        this.props.toggleShake(groupShake);
        // 群组不可以抖屏
        if (groupShake === false) {
            var message = "你[抖了抖]对方";
            if (!conversation || !this.canisend() || !message) return;
            var batch = conversation.length > 1;
            let textMessageContent = this.handleMention(message);
            this.props.sendMessage(textMessageContent);
            this.refs.input.value = "";
            wfc.setConversationDraft(conversation, "");
            e.preventDefault();
        }
    }

    toggleChatHistory(show = !this.state.showChatHistory) {
        //切换历史聊天记录显示隐藏
        this.setState({
            showChatHistory: show,
            showEmoji: false,
            showQuickSend: false,
            showQuickSendList: false,
        });
    }
    //切换快捷回复的显示隐藏
    toggleQuickSend(show = !this.state.showQuickSend) {
        if (show) {
            this.setState({
                showQuickSend: show,
                showChatHistory: false,
                showEmoji: false,
                showQuickSendList: false,
            });
        } else {
            this.setState({
                showQuickSend: show,
                showChatHistory: false,
                showEmoji: false,
                showQuickSendList: true,
            });
        }
    }
    closeAllQuickSend() {
        //关闭所有快捷发送面板
        this.setState({
            showQuickSend: false,
            showQuickSendList: false,
        });
    }
    //切换快捷回复列表显示隐藏
    toggleQuickSendList(show = !this.state.showQuickSendList) {
        this.setState({
            showQuickSendList: show,
            showChatHistory: false,
            showEmoji: false,
            showQuickSend: false,
        });
    }
    downloadedTipNotify() {
        // 发送下载完成的回执
        var conversation = this.props.conversation;
        if (!conversation || !this.canisend()){
            return null;
        }
        let downloadedMessageContent = new TipNotification("downloadfiletip");
        this.props.sendMessage(downloadedMessageContent);
        this.refs.input.value = "";
        wfc.setConversationDraft(conversation, "");
        e.preventDefault();
    }
    outputQuickSend(msg) {
        console.log("快捷发送" + msg);
        // 点击快捷回复直接发送
        var message = msg;
        var conversation = this.props.conversation;
        if (!conversation || !this.canisend() || !message) return;

        let textMessageContent = this.handleMention(message);
        this.props.sendMessage(textMessageContent);
        wfc.setConversationDraft(conversation, "");
    }
    // 更新快捷回复command快捷键指令message快捷回复内容
    updateQuickSend(command, message) {
        // console.log(command,message)
        this.props.updateQuickSend(command, message);
    }
    // 电话
    audioCall(show = !this.state.showEmoji) {
        avenginekitProxy.startCall(this.props.conversation, true, [
            this.props.conversation.target,
        ]);
    }
    // 视频通话
    videoCall(show = !this.state.showEmoji) {
        avenginekitProxy.startCall(this.props.conversation, false, [
            this.props.conversation.target,
        ]);
    }
    // 屏幕截屏
    async screenShot() {
        // if (!isElectron()) {
        //     return;
        // }
        // 触发点击截屏事件
        let returnResult = ipcRenderer.sendSync("screenShot");
        // let ret = wfc.screenShot();
        if (returnResult.done === "done" && returnResult.code == "1") {
            // if (ret === "done") {
            // 图片args
            var args = ipcRenderer.sendSync("file-paste");
            // 如果有图像
            if (args.hasImage && this.canisend()) {
                if (
                    (await this.props.confirmSendImage(args.filename)) === false
                ) {
                    return;
                }
                // 编码
                let parts = [
                    new window.Blob([new window.Uint8Array(args.raw)], {
                        type: "image/png",
                    }),
                ];
                // 图像
                let file = new window.File(parts, args.filename, {
                    lastModified: new Date(),
                    type: "image/png",
                });
                // 批量处理图像,类型检测
                this.batchProcess(file);
            }
        }
        // if (!isElectron()) {
        //     return;
        // }
        // let ret = wfc.screenShot();
    }

    writeEmoji(emoji) {
        var input = this.refs.input;

        //input.value += `[${emoji}]`;
        // input.value += emoji;
        this.placeCaretAtEnd(input);
        this.insertTextAtCaret(emojiParse(emoji).replace(/https:\/\/twemoji\.maxcdn\.com\/v\/12\.1\.6\/72x72\//g,'assets/twemoji/72x72/'));
        // console.log(emojiParse(emoji).replace('https://twemoji.maxcdn.com/v/12.1.6/72x72/','/assets/twemoji/72x72/'));
        input.focus();
    }

    createElementFromHTML(htmlString) {
        let div = document.createElement("div");
        div.innerHTML = htmlString.trim();

        // Change this to div.childNodes to support multiple top-level nodes
        return div.firstChild;
    }

    insertTextAtCaret(text) {
        let sel, range;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();
                if (text.startsWith("<")) {
                    let imgEmoji = this.createElementFromHTML(text);
                    range.insertNode(imgEmoji);
                    range = document.createRange();
                    range.setStartAfter(imgEmoji);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                } else {
                    range.insertNode(document.createTextNode(text));
                }
            }
        } else if (document.selection && document.selection.createRange) {
            document.selection.createRange().text = text;
        }
    }

    async batchProcess(file) {
        // console.log("----------——————————————————什么地址吗？" + file);
        if (this.canisend() === false) {
            return;
        }
        this.props.process(file);
    }
    // 当用户粘贴的时候触发，textarea事件
    async handlePaste(e) {
        console.log(e);
        if (!isElectron()) {
            // 读取委托的图像
            let result = this.readClipImage(e);
            if (this.canisend() && result.hasImage) {
                e.preventDefault();
                let url = URL.createObjectURL(result.file);
                // 发送的图像地址是false
                if ((await this.props.confirmSendImage(url)) === false) {
                    // 撤销地址
                    URL.revokeObjectURL(url);
                    return;
                }
                // 分批处理获取的图片
                this.batchProcess(result.file);
                URL.revokeObjectURL(url);
            }
            return;
        }
        // 渲染图像
        var args = ipcRenderer.sendSync("file-paste");

        if (args.hasImage && this.canisend()) {
            e.preventDefault();

            if ((await this.props.confirmSendImage(args.filename)) === false) {
                return;
            }
            // 未加工
            let parts = [
                new window.Blob([new window.Uint8Array(args.raw)], {
                    type: "image/png",
                }),
            ];
            // 图像
            let file = new window.File(parts, args.filename, {
                lastModified: new Date(),
                type: "image/png",
            });

            this.batchProcess(file);
        }
    }
    // 读取委托的图像
    readClipImage(event) {
        let result = { hasImage: false, file: null };
        // 剪切板数据
        if (event.clipboardData || event.originalEvent) {
            const clipboardData =
                event.clipboardData || event.originalEvent.clipboardData;
            if (clipboardData.items) {
                let blob;
                for (let i = 0; i < clipboardData.items.length; i++) {
                    if (clipboardData.items[i].type.indexOf("image") !== -1) {
                        // 判断并获取文件
                        blob = clipboardData.items[i].getAsFile();
                        result.hasImage = true;
                        result.file = blob;
                        break;
                    }
                }
            }
        }
        return result;
    }

    onGroupInfosUpdate = (groupInfos) => {
        console.log("onGroupInfosupdate", groupInfos);
        if (!this.props || !this.shouldHandleMention(this.props.conversation)) {
            return;
        }
        for (const groupInfo of groupInfos) {
            if (groupInfo.target === this.props.conversation.target) {
                if (this.tribute) {
                    this.tribute.detach(
                        document.getElementById("messageInput")
                    );
                    this.tribute = null;
                }
                this.initMention(this.props.conversation);
                break;
            }
        }
    };

    componentDidMount() {
        localStorage.setItem("isWin", true);
        this.props.initQuickSend();
        // this.props.HistData();
        wfc.eventEmitter.on(
            EventType.GroupInfosUpdate,
            this.onGroupInfosUpdate
        );
        wfc.eventEmitter.on("mention", this.updateMention);
        if (!this.shouldHandleMention(this.props.conversation)) {
            return;
        }
        if (this.props.conversation && !this.tribute) {
            this.initMention(this.props.conversation);
        }
        ipcRenderer.on('downloaded-tip-notify', (event) => {
            console.log('downloaded-tip-notify');
            this.downloadedTipNotify();
        });
    }

    componentWillUnmount() {
        wfc.eventEmitter.removeListener(
            EventType.GroupInfosUpdate,
            this.onGroupInfosUpdate
        );
        wfc.eventEmitter.removeListener("mention", this.updateMention);
    }

    shouldHandleMention(conversation) {
        if (!conversation) {
            return false;
        }
        return conversation.type === ConversationType.Group;
    }

    componentWillReceiveProps(nextProps) {
        var input = this.refs.input;
        if (!input) {
            return;
        }

        if (this.props.conversation) {
            if(!this.props.conversation.type){
                return null;
            }
            if(!this.props.conversation.equal(nextProps.conversation)){
                // let text = input.value.trim();  2
                let text = input.innerHTML.trim();
                let conversationInfo = wfc.getConversationInfo(
                    this.props.conversation
                );
                //  3
                if (!conversationInfo) {
                    return;
                }
                if (text !== conversationInfo.draft) {
                    wfc.setConversationDraft(this.props.conversation, text);
                }

                conversationInfo = wfc.getConversationInfo(nextProps.conversation);
                // input.value = conversationInfo.draft ? conversationInfo.draft : "";  4
                input.innerHTML = conversationInfo ? conversationInfo.draft : "";

                if (this.tribute) {
                    this.tribute.detach(document.getElementById("messageInput"));
                    this.tribute = null;
                }

                if (this.shouldHandleMention(nextProps.conversation)) {
                    this.initMention(nextProps.conversation);
                }
            }
        } else if (nextProps.conversation) {
            let conversationInfo = wfc.getConversationInfo(
                nextProps.conversation
            );
            //  5
            if (!conversationInfo) {
                return;
            }
            // input.value = conversationInfo.draft ? conversationInfo.draft : "";  6
            input.innerHTML = conversationInfo.draft
                ? conversationInfo.draft
                : "";

            if (
                !this.tribute &&
                this.shouldHandleMention(nextProps.conversation)
            ) {
                this.initMention(nextProps.conversation);
            }
        }
    }

    updateMention = (mentionUser) => {
        var input = this.refs.input;
        let groupDisplayName = wfc.getGroupMemberDisplayNameEx(mentionUser);
        if (mentionUser) {
            // input.value += " @" + groupDisplayName + " "; 7
            input.innerHTML += " @" + groupDisplayName + " ";
            this.mentions.push({
                key: groupDisplayName,
                value: "@" + mentionUser.uid,
            });
            input.focus();
        }
    };

    pickGroupMemberToVoip(audioOnly, close) {
        let groupMemberIds = wfc.getGroupMemberIds(
            this.props.conversation.target
        );
        let userInfos = wfc.getUserInfos(
            groupMemberIds,
            this.props.conversation.target
        );

        let checkedIds = new Set();
        let onChange = (e) => {
            if (e.target.checked) {
                checkedIds.add(e.target.name);
            } else {
                checkedIds.delete(e.target.name);
            }
        };

        let startCall = () => {
            if (checkedIds.size > 0) {
                avenginekitProxy.startCall(this.props.conversation, audioOnly, [
                    ...checkedIds,
                ]);
            }

            close();
        };

        let selfUid = wfc.getUserId();

        return (
            <div style={{ margin: 20 }}>
                <div className={classes.voipTargetList}>
                    {userInfos.map((u) => {
                        return (
                            <p key={u.uid}>
                                <label>
                                    <Checkbox
                                        type="checkbox"
                                        defaultChecked={u.uid === selfUid}
                                        disabled={u.uid === selfUid}
                                        onChange={onChange}
                                        name={u.uid}
                                    />
                                    {u.displayName}
                                </label>
                            </p>
                        );
                    })}
                </div>

                <button onClick={startCall}>start call</button>
            </div>
        );
    }

    // 标为已读的方法
    // returnMarkedRead() {
    //     this.props.markedRead(this.props.loadConversations);
    // }

    render() {
        var canisend = this.canisend();
        let canStartVoip =
            this.props.conversation &&
            this.props.conversation.type === ConversationType.Single;
        let isGroup =
            this.props.conversation &&
            this.props.conversation.type === ConversationType.Group;
        let enableMultiCall = false;
        var {
            getHistoryList,
            searchHistory,
            searchingText,
            getList,
            historyList,
        } = this.props;
        return (
            <div
                className={clazz(classes.container, this.props.className, {
                    [classes.shouldSelectUser]: !canisend,
                })}
            >
                <div className={classes.tips}>请先选择一个会话 或 已禁言。</div>

                <div className={classes.action}>
                    <i
                        className="icon-ion-android-attach"
                        id="showUploader"
                        onClick={(e) => canisend && this.refs.uploader.click()}
                    />

                    {/*
                    {
                        isGroup ? (
                            !enableMultiCall ? '' :
                                <Popup key={'voip-video'}
                                       trigger={
                                           <i
                                               className="icon-ion-android-camera"
                                               id="videoCall"
                                           />
                                       }
                                       modal
                                       closeOnDocumentClick
                                       position={"top center"}
                                >
                                    {close => (
                                        this.pickGroupMemberToVoip(false, close)
                                    )
                                    }
                                </Popup>

                        ) : (
                            <i
                                className="icon-ion-android-camera"
                                id="videoCall"
                                onClick={e => canisend && canStartVoip && this.videoCall()}
                            />
                        )
                    }

                    {
                        isGroup ? (
                            !enableMultiCall ? '' :
                                <Popup key={'voip-audio'}
                                       trigger={
                                           <i
                                               className="icon-ion-ios-telephone"
                                               id="audioCall"
                                           />
                                       }
                                       modal
                                       closeOnDocumentClick={true}
                                >
                                    {close => (
                                        this.pickGroupMemberToVoip(true, close)
                                    )
                                    }
                                </Popup>

                        ) : (
                            <i
                                className="icon-ion-ios-telephone"
                                id="audioCall"
                                onClick={e => canisend && canStartVoip && this.audioCall()}
                            />
                        )
                    }
                    */}

                    <i
                        className="icon-ion-scissors"
                        id="screenShot"
                        onClick={(e) => canisend && this.screenShot()}
                        // style={{
                        //     color: "black",
                        // }}
                    />
                    <i
                        className="icon-ion-android-happy"
                        id="showEmoji"
                        onClick={(e) => canisend && this.toggleEmoji()}
                        // style={{
                        //     color: "black",
                        // }}
                    />

                    <span title="发送抖屏"
                        className="iconfont icon-doudong"
                        id="shake"
                        onClick={(e) => canisend && this.toggShake(e)}
                    ></span>

                    {/* <i
                        className="icon-ion-chatbox-working"
                        id="showChatHistory"
                        onClick={e => canisend && this.toggleChatHistory()}
                        style={{
                            color: 'green',
                        }}
                    /> */}

                    {/* <i
                        className="icon-ion-android-send"
                        id="showQuickSend"
                        onClick={(e) => canisend && this.toggleQuickSend()}
                        style={{
                            color: "black",
                        }}
                    /> */}

                    <i
                        className="icon-ion-android-send"
                        title="快捷回复"
                        id="showQuickSendList"
                        onClick={(e) => canisend && this.toggleQuickSendList()}
                        // style={{
                        //     color: "black",
                        // }}
                    />

                    <i
                        className="icon-ion-android-time"
                        title="历史聊天记录"
                        id="showChatHistory"
                        onClick={(e) => canisend && this.toggleChatHistory()}
                        // style={{
                        //     color: "black",
                        // }}
                    />

                    {/* <i
                        className="icon-ion-android-time"
                        id="showChatHist"
                        onClick={(e) => canisend && this.toggleHist()}
                        style={{
                            color: "black",
                        }}
                    /> */}

                    <input
                        onChange={(e) => {
                            // 在input框里面分批处理获取到的图片，图片一般都是要发送到单独的文件服务器
                            this.batchProcess(e.target.files[0]);
                            e.target.value = "";
                        }}
                        ref="uploader"
                        style={{
                            display: "none",
                        }}
                        type="file"
                    />

                    <Emoji
                        close={(e) =>
                            setTimeout(() => this.toggleEmoji(false), 100)
                        }
                        output={(emoji) => this.writeEmoji(emoji)}
                        show={this.state.showEmoji}
                    />

                    <QuickSend
                        close={(e) =>
                            setTimeout(() => this.toggleQuickSend(false), 100)
                        }
                        closeAll={() =>
                            setTimeout(() => this.closeAllQuickSend(), 100)
                        }
                        save={(command, message) =>
                            this.updateQuickSend(command, message)
                        }
                        show={this.state.showQuickSend}
                        quickSendList={this.props.quickSendList}
                    />

                    <QuickSendList
                        close={(e) =>
                            setTimeout(
                                () => this.toggleQuickSendList(false),
                                100
                            )
                        }
                        show={this.state.showQuickSendList}
                        getList={getList}
                        outputQuickSend={(message) =>
                            this.outputQuickSend(message)
                        }
                        openQuickSetting={() => this.toggleQuickSend(true)}
                    />

                    <ChatHistory
                        close={(e) =>
                            setTimeout(() => this.toggleChatHistory(false), 100)
                        }
                        show={this.state.showChatHistory}
                        getHistoryList={getHistoryList}
                        search={(text, starttime, endtime) =>
                            searchHistory(text, starttime, endtime)
                        }
                        searchingText={searchingText}
                        historyList={historyList}
                    />
                    {/* <Hist
                        close={(e) =>
                            setTimeout(() => this.toggleHist(false), 100)
                        }
                        show={this.state.showHist}
                        HistDate={this.props.HistDate}
                    /> */}
                </div>

                {/* <textarea */}
                <div
                    contentEditable={true}
                    className={classes.test}
                    id="messageInput"
                    ref="input"
                    placeholder="输入内容发送，Ctrl + Enter 换行 ..."
                    readOnly={!canisend}
                    onPaste={(e) => this.handlePaste(e)}
                    onKeyPress={(e) => {
                        this.handleEnter(e);
                    }}
                />
            </div>
        );
    }
}
