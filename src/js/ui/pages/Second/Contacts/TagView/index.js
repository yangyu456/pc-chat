import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
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
    updateCheckedList:stores.contacts.updateCheckedList,
    event: stores.wfc.eventEmitter,
    saveUpdate: stores.contacts.saveUpdate,
    getGroupUserList: stores.contacts.getGroupUserList,
    checkedList: stores.contacts.checkedList,
    inputGroupName: stores.contacts.inputGroupName,
    updateGroupNameValue: stores.contacts.updateGroupNameValue,
    backUpdate:stores.contacts.backUpdate
}))
@observer
export default class TagView extends Component {
    renderColumns(data, index, query,checkedList) {
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
                                let bol = false;
                                checkedList.forEach(el => {
                                    if(el.username==e.username&&el.enabled=="1"){
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
                                                }}/>
                                        </div>
                                        <div className={classes.info}>
                                            <p
                                                className={classes.username}
                                                dangerouslySetInnerHTML={{__html: this.props.contactItemName(e)}}/>
                                            {
                                            <CheckBox
                                                className={classes.tagCheck}
                                                checked={bol}
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

    checkHandler(e){
        this.props.updateCheckedList(e);
    }

    inputGroupName(text = '') {
        //自定义分组名输入框输入时
        text = text.trim();
        this.props.inputGroupName(text);
    }

    isInGroup(e,checkedList){
        //初次进入页面时判断用户是否在分组内
        let bol = false;
        checkedList.forEach(el => {
            if(el.username==e.username&&el.enabled=="1"){
                bol = true;
            }
        });
        return bol;
    }

    saveUpdate(){
        //保存分组
        this.props.saveUpdate();
    }

    backUpdate(){
        //返回上一级
        this.props.backUpdate();
    }

    itemPortrait(e) {
        // 由于各种的名字都是portrait
        if (!e.portrait) {
            return Config.DEFAULT_PORTRAIT_URL;
        }else{
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
        //异步获取该分组内的信息
        // this.props.getGroupUserList();
    }

    componentWillUnmount() {
        this.props.event.removeListener(EventType.FriendListUpdate, this.onContactUpdate);
    }

    filter(text = '') {
        text = text.trim();
        this.props.filter(text);
    }

    render() {
        var {query, result} = this.props.filtered;
        var checkedList = this.props.checkedList;
        var updateGroupNameValue = this.props.updateGroupNameValue;
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

        return (
            <div className={classes.container}>
                <div className={classes.searchBar}>
                    {/* <i className="icon-ion-ios-search-strong"/> */}
                    <input
                        id="search-tag"
                        onChange={e => this.inputGroupName(e.target.value)}
                        placeholder='自定义分组名...'
                        value={updateGroupNameValue ? updateGroupNameValue : ''}
                        type="text"/>
                </div>
                <div className={classes.contacts}
                     ref="container">
                    <div className={classes.btnGroup}>
                        <button className={classes.backBtn} type="button" onClick={() => this.backUpdate()}>返回</button>
                        <button className={classes.saveBtn} type="button" onClick={() => this.saveUpdate()}>保存编辑</button>
                    </div>
                    {this.renderColumns(result, 0, query,checkedList)}
                </div>
            </div>
        )
    }
}
