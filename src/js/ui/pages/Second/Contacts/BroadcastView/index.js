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
    expand: stores.contacts.expand,
    contactItemName: stores.contacts.contactItemName,
    updateCheckedListBroad: stores.contacts.updateCheckedListBroad,
    event: stores.wfc.eventEmitter,
    saveUpdate: stores.contacts.saveUpdate,
    saveBroadcast: stores.contacts.saveBroadcast,
    inputBroadCast: stores.contacts.inputBroadCast,
    broadcastContent: stores.contacts.broadcastContent,
    backBroadcast:stores.contacts.backBroadcast,
    tagList:stores.contacts.tagList,
    broadCastGroupSelect:stores.contacts.broadCastGroupSelect,
    toggleSelectGroup:stores.contacts.toggleSelectGroup,
    toggleSelectGroupMember:stores.contacts.toggleSelectGroupMember,
    broadcastGroupMember:stores.contacts.broadcastGroupMember,
    toggleSelectGroupMain:stores.contacts.toggleSelectGroupMain,
    toggleSelectGroupMemberMain:stores.contacts.toggleSelectGroupMemberMain,
    broadcastGroupMemberMain:stores.contacts.broadcastGroupMemberMain
}))
@observer
export default class BroadcastView extends Component {
    renderColumns(data, index, query ,selectedListMember) {
        var list = data.filter((e, i) => i % 1 === index);
        return list.map((e, index) => {
            let groupId = e.prefix;
            return (
                <div
                    className={classes.group}
                    key={index}>
                    <div className={classes.header}>
                        <label>
                            {e.prefix}
                        </label>
                        <CheckBox style={{paddingLeft:'70%'}} className={classes.tagCheck} onClick={() => this.toggleSelectGroupMain(e.prefix,e.list)}></CheckBox>
                        <img onClick={() => this.changeUp(e)} className={classes.icon} src={e.expand ? 'assets/images/extract.png' : 'assets/images/expand.png'}></img>
                        <span style={{
                            position: 'absolute',
                            left: 0,
                            bottom: 0,
                            height: 1,
                            width: '100%',
                            background: '#eaedea',
                        }} />
                    </div>

                    <div className={e.expand ? classes.list : classes.hiddenlist}>
                        {
                            e.list.map((e, index) => {
                                let bol = false;
                                selectedListMember.forEach(element => {
                                    if(element.uid == e.uid){
                                        bol = true;
                                    }
                                });
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
                                                    className={classes.tagCheck} checked={bol?'checked':''}
                                                    onClick={() => this.toggleSelectGroupMemberMain(e,groupId)}
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
    
    renderGroupList(list,selectedList,selectedListMember){
        return list.map((e, index) => {
            let groupId = e.id;
            return (<div className={classes.group} key={e.id}>
                <div className={classes.header}>
                    <label>{e.groupName}</label>
                    <CheckBox style={{paddingLeft:'80%'}} className={classes.tagCheck} onClick={() => this.toggleSelectGroup(groupId,e.users)}></CheckBox>
                </div>
                {e.users.map((e) => {
                    let bol = false;
                    selectedListMember.forEach(element => {
                        if(element.uid == e.uid && element.groupId == groupId){
                            bol = true;
                        }
                    });
                    return (
                    <div
                        className={classes.item}
                        key={e.uid}
                        onClick={() => {
                            //if (query) {
                            //    this.filter('')
                            //}
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
                            >{e.name}</p>
                            <CheckBox
                                className={classes.tagCheck} checked={bol?'checked':''}
                                onClick={() => this.toggleSelectGroupMember(e,groupId)}
                            />
                        </div>
                    </div>);
                })}
            </div>);
        });
    }

    toggleSelectGroup(groupId,users){
        this.props.toggleSelectGroup(groupId,users);
    }

    toggleSelectGroupMember(e,groupId){
        //勾选取消勾选自定义分组内的成员
        this.props.toggleSelectGroupMember(e,groupId);
    }

    toggleSelectGroupMain(prefix,users){
        this.props.toggleSelectGroupMain(prefix,users);
    }

    toggleSelectGroupMemberMain(e,groupId) {
        this.props.toggleSelectGroupMemberMain(e,groupId);
    }

    changeUp(e) {//展开收起分组
        let prefix = e.prefix;
        let expandFlag = !e.expand;
        this.props.expand(prefix, expandFlag, "");
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
        var tagList = this.props.tagList;
        var broadcastContent = this.props.broadcastContent;
        var selectedList = this.props.broadCastGroupSelect;
        var selectedListMember = this.props.broadcastGroupMember;
        var selectedListMemberMain = this.props.broadcastGroupMemberMain;
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
                        row="5">
                    </textarea>
                    <div className={classes.btnGroup}>
                        <button type="button" className={classes.broadBackBtn} onClick={() => this.backBroadcast()}>返回</button>
                        <button type="button" className={classes.broadBtn} onClick={() => this.saveBroadcast()}>发布</button>
                    </div>
                </div>
                <div className={classes.contacts}
                    ref="container" style={{paddingTop:'30px'}}>
                    {this.renderGroupList(tagList,selectedList,selectedListMember)}
                    {this.renderColumns(result, 0, query , selectedListMemberMain)}
                </div>
            </div>
        )
    }
}
