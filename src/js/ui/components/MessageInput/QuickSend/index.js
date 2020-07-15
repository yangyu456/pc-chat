
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clazz from 'classname';
import classes from './style.css';
import onClickOutside from "react-onclickoutside";
import { observer } from 'mobx-react';

@observer
export class QuickSend extends Component {
    //定义参数的类型 func方法 array数组
    static propTypes = {
        show: PropTypes.bool.isRequired,
        close: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
        quickSendList: PropTypes.array,
        closeAll: PropTypes.func.isRequired
    };

    state = {
        quickSendList: this.props.quickSendList,
        currentSelect: "F1",
        firstValue: "",
        showToast: false,
        toastContent: ""
    }

    changeQuick(e) {
        for(let i=0;i<this.state.quickSendList.length;i++){
            let el = this.state.quickSendList.get(i);//Proxy
            if(e.target.value == el.command){
                this.setState({
                    currentSelect: e.target.value
                });
                this.refs.quickContent.value = el.message
                break;
            }
        }
    }

    getFirstValue() {
        // console.log(this.state.quickSendList.get(0).message);
        return this.state.quickSendList.get(0).message;
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    handleClickOutside = evt => {
        // ..handling code goes here...
        this.props.closeAll();
    }

    saveQuickSend = () => {
        // 保存快捷发送事件
        // let myNotification = new Notification('快捷输入', {
        //     body: '自定义快捷输入保存成功'
        // });
        let command = this.refs.command.value;
        let message = this.refs.quickContent.value;
        this.props.save(command,message);
        // 弹出层提示
        this.toast("保存成功！");
    }

    toast(content) {
        this.setState({
            showToast: true,
            toastContent: content 
        })
        setTimeout(() => {
            this.setState({
                showToast: false
            })
        },2000);
    }

    deleteQuickSend = () => {
        //删除(置空当前的快捷回复)
        let command = this.refs.command.value;
        this.refs.quickContent.value = '';
        this.props.save(command,'');
        this.toast("删除成功！");
    }

    onQuickClose = (event) => {
        this.props.close();
    }

    render() {    
        return this.props.show ? (
            <div
                ref="container"
                tabIndex="-1"
                className={clazz(classes.container, classes.show)}
                // onBlur={e => this.props.close()}
            >
                <div className={clazz(classes.quicksend)}>
                    <div className={clazz(classes.control)}>
                        <label htmlFor="quick-control">设置快捷回复：</label>
                        <select id="quick-control" ref="command" onChange={(e) => this.changeQuick(e)}>
                            <option value="F1">F1</option>
                            <option value="F2">F2</option>
                            <option value="F3">F3</option>
                            <option value="F4">F4</option>
                            <option value="F5">F5</option>
                            <option value="F6">F6</option>
                            <option value="F7">F7</option>
                            <option value="F8">F8</option>
                            <option value="F9">F9</option>
                            {/* <option value="F10">F10</option>
                            <option value="F11">F11</option>
                            <option value="F12">F12</option> */}
                        </select>
                    </div>
                    <div className={clazz(classes.content)}>
                        <textarea
                            className="textarea" 
                            ref="quickContent"
                            maxLength="50"
                            placeholder="输入快捷回复内容（50字以内）"
                            rows="4"
                            defaultValue={this.getFirstValue()}>
                        </textarea>
                    </div>
                    <div className={clazz(classes.btnGroup)}>
                        <button type="button" onClick={this.saveQuickSend}>保存</button>
                        <button type="button" onClick={this.deleteQuickSend}>删除</button>
                        <button type="button" onClick={this.onQuickClose}>关闭</button>
                    </div>
                </div>
                <div className={clazz(classes.toast,{[classes.showToast]:this.state.showToast})}>
                    <div className={classes.toastText}>
                        <i 
                            className="icon-ion-checkmark-round" 
                            style={{
                                color: "white",
                                fontSize: "18px"
                            }}
                        />
                        {this.state.toastContent}
                    </div>
                </div>
            </div>
        ) : (null);
    }
}
export default onClickOutside(QuickSend);
