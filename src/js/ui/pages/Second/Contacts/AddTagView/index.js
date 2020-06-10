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
    updateCheckedList: stores.contacts.updateCheckedList,
    event: stores.wfc.eventEmitter,
    saveUpdate: stores.contacts.saveUpdate,
    addGroupNameFlag: stores.contacts.addGroupNameFlag,
    saveAddGroup:stores.contacts.saveAddGroup,
    saveAddGroupName:stores.contacts.saveAddGroupName,
    inputAddGroupName:stores.contacts.inputAddGroupName,
    addGroupNameValue:stores.contacts.addGroupNameValue,
    exitAddGroup:stores.contacts.exitAddGroup
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
        this.props.updateCheckedList(e);
    }

    inputAddGroupName(text = '') {
        //自定义分组名输入框输入时
        text = text.trim();
        this.props.inputAddGroupName(text);
    }

    saveUpdate() {
        //保存分组
        this.props.saveUpdate();
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
        var addGroupNameFlag = this.props.addGroupNameFlag;
        var addGroupNameValue = this.props.addGroupNameValue;
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
                    <i className="icon-ion-ios-search-strong" />
                    <input
                        id="add-tag"
                        onChange={e => this.inputAddGroupName(e.target.value)}
                        placeholder='新建分组名...'
                        value={addGroupNameValue ? addGroupNameValue : ''}
                        disabled={addGroupNameFlag==true}
                        type="text" />
                    <div className={addGroupNameFlag==true ? classes.hiddenGroup : classes.btnGroup}>
                        <button type="button" onClick={() => this.props.saveAddGroupName()}>确定</button>
                        <button type="button" onClick={() => this.props.exitAddGroup()}>返回上级</button>
                    </div>
                </div>
                <div className={classes.addtagview}>
                {addGroupNameFlag == true ? (<div
                    ref="container">
                    <div className={classes.btnGroup}>
                        <button type="button" onClick={() => this.props.saveAddGroup()}>保存分组</button>
                        <button type="button" onClick={() => this.props.exitAddGroup()}>返回上级</button>
                    </div>
                    {this.renderColumns(result, 0, query)}
                </div>) : (<div></div>)}
                </div>
            </div>
        )
    }
}
