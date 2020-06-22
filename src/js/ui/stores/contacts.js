
import { observable, action } from 'mobx';
import { ipcRenderer } from '../../platform';
import axios from 'axios';
import pinyin from '../han';

import chat from './chat';
import storage from 'utils/storage';
import helper from 'utils/helper';
import { normalize } from 'utils/emoji';
import wfc from '../../wfc/client/wfc'
import UserInfo from '../../wfc/model/userInfo';
import GroupInfo from '../../wfc/model/groupInfo';
import NullUserInfo from '../../wfc/model/nullUserInfo';
import NullGroupInfo from '../../wfc/model/nullGroupInfo';
import { func } from 'prop-types';

class Contacts {
    @observable loading = false;
    @observable tagShow = false;
    @observable showGroup = true;
    @observable tagViewShow = false;
    @observable addTagViewShow = false;
    @observable addGroupNameFlag = false;
    @observable broadCastShow = false;
    @observable tagId = "";
    @observable updateGroupNameValue = "";
    @observable addGroupNameValue = "";
    @observable memberList = []; // 包含GroupInfo、UserInfo和ChannelInfo
    @observable tagList = [];
    @observable checkedList = [];
    @observable broadcastContent = "";
    @observable broadCastGroupSelect = [];
    @observable broadcastGroupMember = [];
    @observable broadCastGroupSelectMain = [];
    @observable broadcastGroupMemberMain = [];
    @observable filtered = {
        query: '',
        result: []
    };

    @action group(list, showall = false) {
        var mappings = {};
        var sorted = [];
        list.map(e => {
            if (!e) {
                return;
            }

            // If 'showall' is false, just show your friends
            // if (showall === false
            //     && !(e instanceof UserInfo)) {
            //     return;
            // }

            //原代码 还原请解开注释
            // let name = self.contactItemName(e);
            // var prefix = (pinyin.letter(name, '', null).toString()[0] + '').replace('?', '#');
            // var group = mappings[prefix];

            // if (!group) {
            //     group = mappings[prefix] = [];
            // }
            // group.push(e);

            //陈志豪开发代码
            var prefix = e.deptName;
            var group = mappings[prefix];
            if (!group) {
                group = mappings[prefix] = [];
            }
            group.push(e);
        });

        for (let key in mappings) {
            sorted.push({
                prefix: key,
                list: mappings[key],
                expand: false
            });
        }

        sorted.sort((a, b) => a.prefix.charCodeAt() - b.prefix.charCodeAt());
        //console.log("分组后的列表---"+sorted);
        return sorted;
    }

    contactItemName(item) {
        //原代码，还原请解开这个注释
        var name = '';
        // if (item instanceof UserInfo) {
        //     name = wfc.getUserDisplayName(item.uid);
        // } else if (item instanceof GroupInfo) {
        //     name = item.name;
        // }
        if (item.hasOwnProperty("uid")) {
            // 如果是用户
            name = item.name
        } else if (item.hasOwnProperty("groupName")) {
            //如果是自定义分组
            name = item.groupName;
        }
        return name;
        // return item.name;
    }

    // TODO refactor to getContact, and the return mayby userInfo, GroupInfo 
    @action async getUser(userid) {
        return self.memberList.find(e => e.uid === userid);
        //return self.memberList.find(e => e.username === userid);
    }

    @action async getContacts() {
        self.loading = true;

        self.memberList = [];
        //let friendListIds = wfc.getMyFriendList(false);
        let friendListIds = [];
        let selfUserInfo = wfc.getUserInfo(wfc.getUserId());
        let response = await axios.post('/getStructureChatMembers', {
            username: selfUserInfo.name
        });
        //console.log('---------- getStructureChatMembers', response.data);
        if (response.data) {
            switch (response.data.code) {
                case 0:
                    friendListIds = response.data.result;
                    break;
                default:
                    console.log(response.data);
                    break;
            }
        }
        //陈志豪开发代码
        if (friendListIds.length > 0) {
            friendListIds.forEach(function (dept, index, arr) {
                //如果组织内有人员
                if (dept.members.length > 0) {
                    let obj = { deptName: dept.structureName, pkStructureId: dept.pkStructureId };
                    dept.members.forEach(function (member, mi, ma) {
                        //合并对象
                        var assignObj = Object.assign(member, obj);
                        // 添加用户对象到数组
                        self.memberList.push(assignObj);
                    });
                }
            });
        }
        //console.log("好友列表---"+self.memberList);
        //原代码，还原请解开这个判断的注释
        // console.log('fi', friendListIds.length);
        // if (friendListIds.length > 0) {
        //     friendListIds.map((e) => {
        //         let u = wfc.getUserInfo(e);
        //         if (!(u instanceof NullUserInfo)) {
        //             self.memberList.push(u);
        //         }
        //     });
        // }

        // if (self.showGroup) {
        //     let groupList = wfc.getMyGroupList();
        //     groupList.map(e => {
        //         let g = wfc.getGroupInfo(e);
        //         if (!(g instanceof NullGroupInfo)) {
        //             self.memberList.push(g);
        //         }
        //     });
        // }

        // console.log('好友个数:', self.memberList.length);
        self.loading = false;
        self.filtered.result = self.group(self.memberList, true);
        return (window.list = self.memberList);
    }

    @action async getGroup() {
        //查询个人自定义分组
        self.loading = true;
        self.checkedList = [];
        let groupList = [];
        let selfUserInfo = wfc.getUserInfo(wfc.getUserId());
        let response = await axios.post('/group/querySelfGroupList', {
            username: selfUserInfo.name
        });
        if (response.data) {
            switch (response.data.code) {
                case 0:
                    groupList = response.data.result;
                    break;
                default:
                    console.log(response.data);
                    break;
            }
        }
        self.tagList = groupList;
        self.loading = false;
    }

    @action async getGroupUserList() {
        //查询个人自定义分组下的成员
        self.loading = true;
        var groupMemberList = [];
        let response = await axios.post('/group/querySelfGroupUsersList', {
            groupId: self.tagId
        });
        if (response.data) {
            switch (response.data.code) {
                case 0:
                    groupMemberList = response.data.result;
                    break;
                default:
                    console.log(response.data);
                    break;
            }
        }
        self.checkedList = groupMemberList;
        self.loading = false;
        return (window.checkedList = self.checkedList);
    }

    @action filter(text = '', showall = false) {
        let textTemp = text;
        text = pinyin.letter(text.toLocaleLowerCase(), '', null);
        var list = self.memberList.filter(e => {
            let name = self.contactItemName(e);
            var res = pinyin.letter(name, '', null).toLowerCase().indexOf(text) > -1;
            // if (e.RemarkName) {
            //     res = res || pinyin.letter(e.RemarkName, null).toLowerCase().indexOf(text) > -1;
            // }
            return res;
        });

        if (!self.showGroup) {
            list = list.filter(e => {
                return !(e instanceof GroupInfo);
            });
        }

        self.filtered = {
            query: textTemp,
            result: list.length ? self.group(list, showall) : []
        };
    }
    
    @action inputGroupName(text = '') {
        self.updateGroupNameValue = text;
    }

    @action inputAddGroupName(text = '') {
        self.addGroupNameValue = text;
    }

    @action inputBroadCast(text = ''){
        self.broadcastContent = text;
    }

    @action expandGroup(list, prefix, expandFlag) {
        var newGroup = list.map((e) => {
            if (e.prefix == prefix) {
                e.expand = expandFlag;
            }
            return e;
        });
        return newGroup;
    }

    @action expand(prefix, expandFlag, searchKey) {
        var list = self.filtered.result;
        self.filtered = {
            query: searchKey,
            result: self.expandGroup(list, prefix, expandFlag)
        }
    }

    @action toggleGroup(showGroup) {
        self.showGroup = showGroup;
    }

    @action showTagInfo() {
        if (self.tagShow == true) {
            return null;
        }
        self.tagShow = true;
    }

    @action hideTagInfo() {
        if(!self.tagShow){
            return null;
        }
        self.tagShow = false;
    }

    @action showTagView(e) {
        if (self.tagViewShow) {
            return null;
        }
        self.tagId = e.id;
        self.updateGroupNameValue = e.groupName;
        self.getGroupUserList();
        self.tagViewShow = true;
    }

    @action async updateCheckedList(item) {
        let bol = false;
        let checkedListtmp = self.checkedList;
        for (var i = 0; i < checkedListtmp.length; i++) {
            if (checkedListtmp[i].username == item.username) {
                // 如果选中,则取消选中
                let enabled = "0";
                if (checkedListtmp[i].enabled == "1") {
                    // checkedListtmp[i].enabled = "0";
                } else {
                    enabled = "1";
                    // checkedListtmp[i].enabled = "1";
                }
                bol = true;
                // 更新个人自定义分组下的成员
                let updateMember = {
                    "id": checkedListtmp[i].id,
                    "showIndex": "0",
                    "enabled": enabled,
                    "username": item.username
                };
                let response = await axios.post('/group/updateSelfGroupUsers', updateMember);
                if (response.data) {
                    switch (response.data.code) {
                        case 0:
                            console.log("updateSelfGroupUsers success");
                            let responses = await axios.post('/group/querySelfGroupUsersList', {
                                groupId: self.tagId
                            });
                            if (responses.data) {
                                switch (responses.data.code) {
                                    case 0:
                                        checkedListtmp = responses.data.result;
                                        break;
                                    default:
                                        console.log(responses.data);
                                        break;
                                }
                            }
                            break;
                        default:
                            console.log(response.data);
                            break;
                    }
                }
                break;
            }
        }
        //添加个人自定义分组下的成员
        if (!bol) {
            let newMember = {
                "username": item.username,
                "groupId": self.tagId,
                "showIndex": 0,
                "enabled": "1"
            };
            let response = await axios.post('/group/addSelfGroupUsers', newMember);
            if (response.data) {
                switch (response.data.code) {
                    case 0:
                        let responses = await axios.post('/group/querySelfGroupUsersList', {
                            groupId: self.tagId
                        });
                        if (responses.data) {
                            switch (responses.data.code) {
                                case 0:
                                    checkedListtmp = responses.data.result;
                                    break;
                                default:
                                    console.log(responses.data);
                                    break;
                            }
                        }
                        break;
                    default:
                        console.log(response.data);
                        break;
                }
            }
        }
        self.checkedList = checkedListtmp;
        return (window.checkedList = self.checkedList);
    }

    @action async saveUpdate() {
        //保存分组并关闭编辑分组
        self.loading = true;
        let updateGroup = {
            "id":self.tagId,
            "groupName":self.updateGroupNameValue,
            "showIndex":"0",
            "enabled":"1"
        }
        let response = await axios.post('/group/updateSelfGroup', updateGroup);
        if (response.data) {
            switch (response.data.code) {
                case 0:
                    console.log("updateSelfGroup Success"+response.data);
                    break;
                default:
                    console.log("updateSelfGroup failed"+response.data);
                    break;
            }
        }
        self.loading = false;
        self.getGroup();
        return (self.tagViewShow = false);
    }

    @action backUpdate() {
        self.getGroup();
        self.tagViewShow = false;
    }

    @action saveAddGroupName(){
        //新增自定义分组 保存分组名字
        let selfUserInfo = wfc.getUserInfo(wfc.getUserId());
        let addGroupNameData = {
            "username":selfUserInfo.name,
            "groupName":self.addGroupNameValue,
            "showIndex":"0",
            "enabled":"1"
        };
        self.saveAddGroupNameReq(addGroupNameData);
    }

    @action async saveAddGroupNameReq(data){
        let response = await axios.post('/group/addSelfGroup', data);
        if (response.data) {
            switch (response.data.code) {
                case 0:
                    self.addGroupNameFlag = true;
                    self.tagId = response.data.result;
                    self.getGroup();
                    console.log("addSelfGroup Success"+response.data);
                    break;
                default:
                    console.log("addSelfGroup failed"+response.data);
                    break;
            }
        }
    }

    @action showAddTagView() {
        //打开添加分组界面
        if (self.addTagViewShow) {
            return null;
        }
        self.addGroupNameValue = "";
        self.checkedList = [];
        self.addTagViewShow = true;
    }

    @action saveAddGroup() {
        //保存并关闭新建分组页面
        if(!self.addTagViewShow){
            return null;
        }
        self.addGroupNameValue = "";
        self.addTagViewShow = false;
        self.addGroupNameFlag = false;
    }

    @action exitAddGroup() {
        //退出新建分组页面
        self.addTagViewShow = false;
        self.addGroupNameFlag = false;
        self.addGroupNameValue = "";
    }

    @action showBroadCastView() {
        //打开发布广播界面
        if(self.broadCastShow){
            return null;
        }
        self.broadcastContent = "";
        self.tagShow = true;
        self.broadCastShow = true;
    }

    @action async saveBroadcast(){
        //发布并关闭广播界面
        if(!self.broadCastShow){
            return null;
        }
        let userIds = [];
        self.broadcastGroupMemberMain.forEach((v,i) => {
            userIds.push(v.uid);
        });
        self.broadcastGroupMember.forEach((v,i) => {
            userIds.push(v.uid);
        });
        if(userIds.length==0){
            //如果没选中任何人
            return null;
        }
        if(self.broadcastContent==""){
            //如果内容为空
            return null;
        }
        let broadcastData = {
            "fromUserId":wfc.getUserId(),
            "msgText":self.broadcastContent,
            "toUserIds":userIds
        };
        let response = await axios.post('/msg/broadcast', broadcastData);
        if (response.data) {
            switch (response.data.code) {
                case 0:
                    console.log("broadcast Success"+response.data);
                    break;
                default:
                    console.log("broadcast failed"+response.data);
                    break;
            }
        }
        self.broadcastGroupMember = [];
        self.broadcastGroupMemberMain = [];
        self.broadCastGroupSelect = [];
        self.broadCastGroupSelectMain = [];
        self.broadCastShow = false;
        self.broadcastContent = "";
        self.tagShow = false;
    }

    @action backBroadcast() {
        self.broadcastGroupMember = [];
        self.broadcastGroupMemberMain = [];
        self.broadCastGroupSelect = [];
        self.broadCastGroupSelectMain = [];
        self.broadCastShow = false;
        self.broadcastContent = "";
        self.tagShow = false;
    }

    @action toggleSelectGroup(groupId,users) {
        if (!self.broadCastGroupSelect.includes(groupId)) {
            // Add
            self.addSelected(groupId,users);
        } else {
            // Remove
            self.removeSelected(groupId,users);
        }
    }

    @action toggleSelectGroupMain(prefix,users) {
        if (!self.broadCastGroupSelectMain.includes(prefix)) {
            // Add
            self.addSelectedMain(prefix,users);
        } else {
            // Remove
            self.removeSelectedMain(prefix,users);
        }
    }

    @action toggleSelectGroupMember(member,groupId) {
        member.groupId = groupId;
        let result = self.broadcastGroupMember.some(item=>{
            if(item.uid==member.uid&&item.groupId==member.groupId){
                return true;
            }
        });
        if(!result){
            self.addSelectedMember(member);  
        } else {
            self.removeSelectedMember(member);  
        }
    }

    @action toggleSelectGroupMemberMain(member,groupId) {
        member.groupId = groupId;
        let result = self.broadcastGroupMemberMain.some(item=>{
            if(item.uid==member.uid&&item.groupId==member.groupId){
                return true;
            }
        });
        if(!result){
            self.addSelectedMemberMain(member);  
        } else {
            self.removeSelectedMemberMain(member);  
        }
    }

    @action toggleAddGroupMember(member,groupId) {
        member.groupId = groupId;
        let result = self.broadcastGroupMember.some(item=>{
            if(item.uid==member.uid&&item.groupId==member.groupId){
                return true;
            }
        });
        if(!result){
            self.addSelectedMember(member);  
        } else {
            return null;
        }
    }

    @action toggleAddGroupMemberMain(member,groupId) {
        member.groupId = groupId;
        let result = self.broadcastGroupMemberMain.some(item=>{
            if(item.uid==member.uid&&item.groupId==member.groupId){
                return true;
            }
        });
        if(!result){
            self.addSelectedMemberMain(member);  
        } else {
            return null;
        }
    }

    @action addSelected(groupId,users) {
        let selected = [
            groupId,
            ...self.broadCastGroupSelect,
        ];
        self.broadCastGroupSelect = selected;
        users.forEach(v => {
            //批量添加组内人员选中
            self.toggleAddGroupMember(v,groupId);
        });
    }

    @action addSelectedMain(groupId,users) {
        let selected = [
            groupId,
            ...self.broadCastGroupSelectMain,
        ];
        self.broadCastGroupSelectMain = selected;
        users.forEach(v => {
            //批量添加组内人员选中
            self.toggleAddGroupMemberMain(v,groupId);
        });
    }

    @action removeSelected(groupId,users) {
        let selected = self.broadCastGroupSelect;
        let index = selected.indexOf(groupId);
        selected = [
            ...selected.slice(0, index),
            ...selected.slice(index + 1, selected.length)
        ];
        self.broadCastGroupSelect = selected;
        self.removeByGroupId(groupId);
    }

    @action removeSelectedMain(groupId,users) {
        let selected = self.broadCastGroupSelectMain;
        let index = selected.indexOf(groupId);
        selected = [
            ...selected.slice(0, index),
            ...selected.slice(index + 1, selected.length)
        ];
        self.broadCastGroupSelectMain = selected;
        self.removeByGroupIdMain(groupId);
    }

    @action addSelectedMember(member) {
        let selected = [
            member,
            ...self.broadcastGroupMember,
        ];
        self.broadcastGroupMember = selected;
    }

    @action addSelectedMemberMain(member) {
        let selected = [
            member,
            ...self.broadcastGroupMemberMain,
        ];
        self.broadcastGroupMemberMain = selected;
    }

    @action removeSelectedMember(member) {
        let selected = self.broadcastGroupMember;
        selected.forEach((v,index) => {
            if(v.uid==member.uid&&v.groupId==member.groupId){
                selected = [
                    ...selected.slice(0, index),
                    ...selected.slice(index + 1, selected.length)
                ];
            }
        });
        self.broadcastGroupMemberMain = selected;
    }

    @action removeSelectedMemberMain(member) {
        let selected = self.broadcastGroupMemberMain;
        selected.forEach((v,index) => {
            if(v.uid==member.uid&&v.groupId==member.groupId){
                selected = [
                    ...selected.slice(0, index),
                    ...selected.slice(index + 1, selected.length)
                ];
            }
        });
        self.broadcastGroupMemberMain = selected;
    }

    @action removeByGroupId(groupId) {
        let selected = self.broadcastGroupMember;
        let newSelected = [];
        selected.forEach(v => {
            if(v.groupId!=groupId){
                newSelected.push(v);
            }
        });
        self.broadcastGroupMember = newSelected;
    }

    @action removeByGroupIdMain(groupId) {
        let selected = self.broadcastGroupMemberMain;
        let newSelected = [];
        selected.forEach(v => {
            if(v.groupId!=groupId){
                newSelected.push(v);
            }
        });
        self.broadcastGroupMemberMain = newSelected;
    }

    @action async deleteUser(id) {
        // TODO
    }

    @action async updateUser(user) {
        // TODO
    }
}

const self = new Contacts();
export default self;
