import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import classes from './style.css';
import EventType from '../../../../../wfc/client/wfcEvent';
import stores from '../../../../stores';
import wfc from '../../../../../wfc/client/wfc';
import Config from "../../../../../config";
import CheckBox from 'rc-checkbox';
import { store } from 'emoji-mart';

@inject(stores => ({
    filter: stores.contacts.filter,
    filtered: stores.contacts.filtered,
    getContacts: stores.contacts.getContacts,
    showUserinfo: (show, user) => {
        user = wfc.getUserInfo(user.uid, true);
        stores.contactInfo.toggle(show, user);
    },
    contactItemName: stores.contacts.contactItemName,
    updateCheckedListBroad: stores.contacts.updateCheckedListBroad,
    event: stores.wfc.eventEmitter,
    saveUpdate: stores.contacts.saveUpdate,
    saveBroadcast: stores.contacts.saveBroadcast,
    inputBroadCast: stores.contacts.inputBroadCast,
    broadcastContent: stores.contacts.broadcastContent,
    backBroadcast:stores.contacts.backBroadcast
}))
@observer
export default class TagView extends Component {
    renderColumns(data, index, query) {
        var list = data.filter((e, i) => i % 1 === index);
        return list.map((e, index) => {
            return (
                <div
                    className={classes.group}
                    key={index}>
                    {/* { <div className={classes.header}>
                        <label>
                            {e.prefix}
                        </label>
                        <img className={classes.icon}></img>
                        <span style={{
                            position: 'absolute',
                            left: 0,
                            bottom: 0,
                            height: 1,
                            width: '100%',
                            background: '#eaedea',
                        }}/>
                    </div> } */}

                    <div className={classes.list}>
                        {
                            e.list.map((e, index) => {
                                return (
                                    <div
                                        className={classes.item}
                                        key={index}
                                        onClick={() => {
                                            if (query) {
                                                this.filter('')
                                            }
                                            this.props.showUserinfo(true, e)
                                        }}>
                                        <div className={classes.avatar}>
                                            <img
                                                src={this.itemPortrait(e)}
                                                style={{
                                                    height: 32,
                                                    width: 32,
                                                }} />
                                        </div>
                                        <div className={classes.info}>
                                            <p
                                                className={classes.username}
                                                dangerouslySetInnerHTML={{ __html: this.props.contactItemName(e) }} />
                                            {
                                                <CheckBox
                                                    className={classes.tagCheck}
                                                    onClick={() => this.checkHandler(e)}
                                                />
                                            }
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            );
        });
    }

    checkHandler(e) {
        this.props.updateCheckedListBroad(e);
    }

    inputBroadCast(text = '') {
        //自定义分组名输入框输入时
        text = text.trim();
        this.props.inputBroadCast(text);
    }

    saveBroadcast() {
        //保存分组
        this.props.saveBroadcast();
    }

    backBroadcast() {
        //关闭
        this.props.backBroadcast();
    }

    itemPortrait(e) {
        // 由于各种的名字都是portrait
        if (!e.portrait) {
            return Config.DEFAULT_PORTRAIT_URL;
        } else {
            return e.portrait;
        }
    }

    onContactUpdate = () => {
        this.props.getContacts();
    }

    componentWillMount() {
        // this.props.getContacts();
        // this.props.filter();
        this.props.event.on(EventType.FriendListUpdate, this.onContactUpdate);
    }

    componentWillUnmount() {
        this.props.event.removeListener(EventType.FriendListUpdate, this.onContactUpdate);
    }

    filter(text = '') {
        text = text.trim();
        this.props.filter(text);
    }

    render() {
        var { query, result } = this.props.filtered;
        var broadcastContent = this.props.broadcastContent;
        return (
            <div className={classes.container}>
                <div className={classes.searchBar}>
                    {/* <i className="icon-ion-ios-search-strong" /> */}
                    <textarea
                        className={classes.broadcastContent}
                        onChange={e => this.inputBroadCast(e.target.value)}
                        value={broadcastContent ? broadcastContent : ''}
                        placeholder='请输入广播内容...'
                        ref="broadcast"
                        row="4">
                    </textarea>
                    <div className={classes.btnGroup}>
                        <button type="button" className={classes.broadBackBtn} onClick={() => this.backBroadcast()}>返回</button>
                        <button type="button" className={classes.broadBtn} onClick={() => this.saveBroadcast()}>发布</button>
                    </div>
                </div>
                <div className={classes.contacts}
                    ref="container" style={{paddingTop:'30px'}}>
                    {this.renderColumns(result, 0, query)}
                </div>
            </div>
        )
    }
}
