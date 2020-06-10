import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import clazz from 'classname';
import randomColor from 'randomcolor';

import classes from './style.css';
import EventType from '../../../../wfc/client/wfcEvent';
import stores from '../../../stores';
import wfc from '../../../../wfc/client/wfc';
import Config from "../../../../config";
import TagView from "./TagView"
import AddTagView from "./AddTagView"
import BroadcastView from "./BroadcastView"
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
    event: stores.wfc.eventEmitter,
    expand: stores.contacts.expand,
    showTagInfo: stores.contacts.showTagInfo,
    tagShow: stores.contacts.tagShow,
    tagList: stores.contacts.tagList,
    showTagView: stores.contacts.showTagView,
    tagViewShow: stores.contacts.tagViewShow,
    showAddTagView: stores.contacts.showAddTagView,
    addTagViewShow: stores.contacts.addTagViewShow,
    showBroadCastView:stores.contacts.showBroadCastView,
    broadCastShow:stores.contacts.broadCastShow,
    getGroup:stores.contacts.getGroup,
    hideTagInfo: stores.contacts.hideTagInfo
}))
@observer
export default class Contacts extends Component {
    renderColumns(data, index, query) {
        var list = data.filter((e, i) => i % 1 === index);
        return list.map((e, index) => {
            return (
                <div
                    className={classes.group}
                    key={index}>
                    <div className={classes.header} onClick={() => this.changeUp(e)}>
                        <label>
                            {e.prefix}
                        </label>
                        <img className={classes.icon} src={e.expand ? 'assets/images/extract.png' : 'assets/images/expand.png'}></img>
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
                                return (
                                    <div
                                        className={classes.item}
                                        key={index}
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
                                                dangerouslySetInnerHTML={{ __html: this.props.contactItemName(e) }} />
                                            {/*
                                            <p
                                                className={classes.signature}
                                                dangerouslySetInnerHTML={{__html: e.Signature || ''}}
                                            />
                                            */}
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

    renderTags() {
        return (<div className={classes.group} style={{ cursor: 'pointer' }} onClick={() => { this.props.showTagInfo() }}>
            <div
                className={classes.taginner}>
                <img className={classes.avatar}
                    src={'assets/images/grouptag.png'}
                    style={{
                        height: 24,
                        width: 24,
                    }} />
                <div className={classes.info, classes.tagtitle}>
                    自定义分组
                        </div>
            </div>
        </div>);
    }

    renderBroadCast() {
        return (<div className={classes.group} style={{ cursor: 'pointer' }} onClick={() => { this.props.showBroadCastView() }}>
            <div
                className={classes.taginner}>
                <img className={classes.avatar}
                    src={'assets/images/broadcast.png'}
                    style={{
                        height: 24,
                        width: 24,
                    }} />
                <div className={classes.info, classes.tagtitle}>
                    发布广播消息
                        </div>
            </div>
        </div>);
    }

    renderTagList(list) {//渲染标签列表
        return list.map((e, index) => {
            return (<div className={classes.group}>
                <label onClick={() => this.showTagView(e)}>{e.groupName}</label>
                {e.users.map((e) => {
                    return (
                    <div
                        className={classes.item}
                        key={index}
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
                        </div>
                    </div>);
                })}
            </div>);
        });
    }

    itemPortrait(e) {
        // 由于各种的名字都是portrait
        if (!e.portrait) {
            return Config.DEFAULT_PORTRAIT_URL;
        } else {
            return e.portrait;
        }
    }

    changeUp(e) {//展开收起分组
        let prefix = e.prefix;
        let expandFlag = !e.expand;
        let searchKey = document.getElementById('search').value;
        this.props.expand(prefix, expandFlag, searchKey);
    }

    showTagView(e) {//显示标签详情
        //{"id":"1","groupName":"分组1","showIndex":"0","enabled":"1"}
        this.props.showTagView(e);
    }

    hideTagInfo() {//关闭标签页面
        this.props.hideTagInfo();
    }

    showAddTagView(e) {//显示添加自定义分组界面
        this.props.showAddTagView();
    }

    onContactUpdate = () => {
        this.props.getContacts();
    }

    componentWillMount() {
        this.props.getContacts();
        this.props.getGroup();
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
        // TODO 未搜索到结果的ui
        // if (query && result.length === 0) {
        //     return (
        //         <div className={classes.container}>
        //             <div className={classes.searchBar}>
        //                 <i className="icon-ion-ios-search-strong"/>
        //                 <input
        //                     id="search"
        //                     onInput={e => this.filter(e.target.value)}
        //                     placeholder="搜索 ..."
        //                     ref="search"
        //                     type="text"/>
        //             </div>
        //             <p>no found</p>
        //         </div>
        //     );
        // }

        return (this.props.tagShow == false ? (
            <div className={classes.container}>
                <div className={classes.searchBar}>
                    <i className="icon-ion-ios-search-strong" />
                    <input
                        id="search"
                        onInput={e => this.filter(e.target.value)}
                        placeholder={query ? '' : '搜索 ...'}
                        value={query ? query : ''}
                        ref="search"
                        type="text" />
                </div>
                <div className={classes.contacts}
                    ref="container">
                    {this.renderTags()}
                    {this.renderBroadCast()}
                    {this.renderColumns(result, 0, query)}
                </div>
            </div>) :
            (this.props.tagViewShow == false && this.props.addTagViewShow == false && this.props.broadCastShow == false ? (
                <div className={classes.container}>
                    <div className={classes.searchBar}>
                        <p style={{lineHeight:'40px',textIndent:'74px',fontSize:'20px',color:'#4377B0'}}>我的自定义分组</p>
                    </div>
                    <div className={classes.contacts}>
                        <div className={classes.addTag} onClick={() => this.props.showAddTagView()} style={{width: '100%', fontSize: '20px', color: '#4377B0', lineHeight: '32px',textIndent:'55px' }}>➕新增自定义分组</div>
                        <button className={classes.backBtn} type="button" onClick={() => { this.hideTagInfo() }}>返回上一级</button>
                        <div className={classes.tagList}>
                            {this.renderTagList(tagList)}
                        </div>
                    </div>
                </div>) :
                (this.props.tagViewShow == true ? <TagView /> : (this.props.broadCastShow == false? <AddTagView />:<BroadcastView />))
            )
        );
    }
}
