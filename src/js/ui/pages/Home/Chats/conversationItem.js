import clazz from "classname";
import React, { Component } from "react";
import { parser as emojiParse } from "utils/emoji";
import helper from "utils/helper";
import ConversationType from "../../../../wfc/model/conversationType";
import classes from "./style.css";
import ConversationInfo from "../../../../wfc/model/conversationInfo";
import {
    isElectron,
    popMenu,
    ContextMenuTrigger,
    hideMenu,
} from "../../../../platform";

export default class ConversationItem extends Component {
    active = false;

    // 1. 原来是空的
    // 2. 绑定新的数据(新会话，会话更新了, 会话的target更新了)
    // 3. 选中、取消选中
    shouldComponentUpdate(nextProps) {
        if (!this.props.conversationInfo || this.active === undefined) {
            return true;
        }

        if (
            !ConversationInfo.equals(
                this.props.conversationInfo,
                nextProps.conversationInfo
            )
        ) {
            return true;
        }

        if (
            nextProps.currentConversation &&
            this.active !==
                nextProps.currentConversation.equal(
                    nextProps.conversationInfo.conversation
                )
        ) {
            return true;
        }

        return false;
    }

    // 右键菜单
    showContextMenu(conversationInfo, menuId) {
        let templates = [
            {
                //label: 'Send Message',
                label: "发送消息",
                click: () => {
                    this.props.chatTo(conversationInfo.conversation);
                },
            },
            {
                type: "separator",
            },
            {
                // label: conversationInfo.isTop ? "Unsticky" : "Sticky on Top",
                label: conversationInfo.isTop ? "取消置顶" : "置顶聊天",
                click: () => {
                    this.props.sticky(conversationInfo);
                },
            },
            {
                //label: 'Delete',
                label: "删除",
                click: () => {
                    this.props.removeChat(conversationInfo);
                    this.props.removeConversation(conversationInfo);
                },
            },
            {
                //label: 'Mark as Read',标记为已读
                label: "标为已读",
                click: () => {
                    this.props.markedRead(conversationInfo);
                },
            },
        ];

        return popMenu(templates, conversationInfo, menuId);
    }
    // 处理错误的事件
    handleError(e) {
        if (!e.target.src.endsWith("assets/images/user-fallback.png")) {
            e.target.src = "assets/images/user-fallback.png";
        }
    }

    render() {
        let e = this.props.conversationInfo;
        let conversation = this.props.currentConversation;
        // 是否是当前对话框
        this.active = conversation && conversation.equal(e.conversation);
        let chatTo = this.props.chatTo;
        // 布尔值
        var muted = e.isSilent;
        var isTop = e.isTop;
        let unreadCount = e.unreadCount;
        // 未读的数量 布尔值
        let hasUnread =
            (unreadCount.unread > 0 ||
                unreadCount.unreadMention > 0 ||
                unreadCount.unreadMentionAll > 0) &&
            !this.active;
        var portrait = e.portrait();
        // 未读数量
        let txtUnread = unreadCount.unread > 99 ? "..." : unreadCount.unread;
        if (!portrait) {
            switch (e.conversation.type) {
                case ConversationType.Single:
                    portrait = "assets/images/user-fallback.png";
                    break;
                case ConversationType.Group:
                    portrait = "assets/images/default_group_avatar.png";
                    break;
                default:
                    break;
            }
        }

        if (isElectron()) {
            var userInfo =
                this.props.getUserInfo &&
                e.lastMessage &&
                this.props.getUserInfo(e.lastMessage.from, false, e.target);
            // console.warn("console-user-list", e);
            var userName =
                userInfo && e.conversation.conversationType === 1
                    ? userInfo.displayName + ":"
                    : "";
            return (
                <div
                    className={clazz(classes.chat, {
                        [classes.sticky]: isTop,
                        [classes.active]: this.active,
                    })}
                    // TODO key should be conversation 待办事项的关键应该是对话
                    onContextMenu={(ev) => this.showContextMenu(e)}
                    onClick={(ev) => {
                        chatTo(e.conversation);
                        this.props.markedRead(e);
                    }}
                >
                    <div className={classes.inner}>
                        {/* 通过attr控制属性 */}
                        <div
                            data-aftercontent={txtUnread}
                            className={clazz(classes.dot, {
                                [classes.green]: muted && hasUnread,
                                [classes.red]: !muted && hasUnread,
                            })}
                        >
                            <img
                                className="disabledDrag"
                                // TODO portrait
                                src={portrait}
                                onError={this.handleError}
                            />
                        </div>

                        <div className={classes.info}>
                            <p
                                className={classes.username}
                                dangerouslySetInnerHTML={{ __html: e.title() }}
                            />

                            <span
                                className={classes.message}
                                //     dangerouslySetInnerHTML={{
                                //         __html: e.draft
                                //             ? "[草稿]" + e.draft
                                //             : e.lastMessage &&
                                //               e.lastMessage.messageContent
                                //             ? e.lastMessage.messageContent.digest(
                                //                   e.lastMessage
                                //               )
                                //             : "",
                                //     }}
                                // />
                                dangerouslySetInnerHTML={{
                                    __html: e.draft
                                        ? "[草稿]" + e.draft
                                        : e.lastMessage &&
                                          e.lastMessage.messageContent
                                        ? userName +
                                          emojiParse(
                                              e.lastMessage.messageContent.digest(
                                                  e.lastMessage
                                              )
                                          ).replace(/https:\/\/twemoji\.maxcdn\.com\/v\/12\.1\.6\/72x72\//g,'assets/twemoji/72x72/')
                                        : "",
                                }}
                            />
                        </div>
                    </div>

                    <span className={classes.times}>
                        {e.timestamp ? helper.timeFormat(e.timestamp) : ""}
                    </span>
                </div>
            );
        } else {
            let conversationKey = e.conversation
                ? e.conversation.type +
                  e.conversation.target +
                  e.conversation.linei
                : "";
            let menuId = `conversation_item_${conversationKey}`;
            return (
                <div>
                    <ContextMenuTrigger id={menuId}>
                        <div
                            className={clazz(classes.chat, {
                                [classes.sticky]: isTop,
                                [classes.active]: this.active,
                            })}
                            onClick={(ev) => {
                                chatTo(e.conversation);
                                this.props.markedRead(e);
                            }}
                        >
                            <div className={classes.inner}>
                                <div
                                    data-aftercontent={txtUnread}
                                    className={clazz(classes.dot, {
                                        [classes.green]: muted && hasUnread,
                                        [classes.red]: !muted && hasUnread,
                                    })}
                                >
                                    <img
                                        className="disabledDrag"
                                        // TODO portrait
                                        src={portrait}
                                        onError={this.handleError}
                                    />
                                </div>

                                <div className={classes.info}>
                                    <p
                                        className={classes.username}
                                        dangerouslySetInnerHTML={{
                                            __html: e.title(),
                                        }}
                                    />

                                    <span
                                        className={classes.message}
                                        dangerouslySetInnerHTML={{
                                            __html: e.draft
                                                ? "[草稿]" + e.draft
                                                : e.lastMessage &&
                                                  e.lastMessage.messageContent
                                                ? e.lastMessage.messageContent.digest(
                                                      e.lastMessage
                                                  )
                                                : "",
                                        }}
                                    />
                                </div>
                            </div>

                            <span className={classes.times}>
                                {e.timestamp
                                    ? helper.timeFormat(e.timestamp)
                                    : ""}
                            </span>
                        </div>
                    </ContextMenuTrigger>
                    {this.showContextMenu(e, menuId)}
                </div>
            );
        }
    }
}
