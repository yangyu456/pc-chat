
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clazz from 'classname';
import classes from './style.css';
import onClickOutside from "react-onclickoutside";
import { observer } from 'mobx-react';
import '!style-loader!css-loader!./react-datetime.css'
const Datetime = require('react-datetime');
var moment = require('moment');
require('moment/locale/zh-cn');
@observer
export class ChatHistory extends Component {
    static propTypes = {
        show: PropTypes.bool.isRequired,
        close: PropTypes.func.isRequired,
        getHistoryList: PropTypes.func,
        search: PropTypes.func,
        searchingText: PropTypes.string,
        historyList: PropTypes.func
    };

    state = {
        starttime:"",
        endtime:"",
        showToast:false,
        toastContent:""
    }

    componentDidMount() {
        // this.refs.quickContent.value = this.state.quickSendList.get(0).message;
    }

    componentWillUnmount() {
    }

    handleClickOutside = evt => {
        // ..handling code goes here...
        this.props.close();
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

    search() {
        let text = this.refs.input.value;
        let starttime = this.state.starttime;
        let endtime = this.state.endtime;
        if(new Date(starttime).getTime() > new Date(endtime).getTime()){
            // 如果开始大于结束时间
            this.toast("开始时间不能大于结束时间！");
            return null;
        }
        // console.log(starttime,endtime);
        this.props.search(text,starttime,endtime);
    }

    getDayStr(date){
        let today = date;
        let y = today.getFullYear();
        let m = today.getMonth()+1;
        let d = today.getDate();
        let h = today.getHours();
        let mm = today.getMinutes();
        let ss = today.getSeconds();
        if(m<10){
            m="0"+m;
        }
        if(d<10){
            d="0"+d;
        }
        if(h<10){
            h="0"+h;
        }
        if(mm<10){
            mm="0"+mm;
        }
        if(ss<10){
            ss="0"+ss;
        }
        let signDay = y + "-" + m + "-" + d + " " + h + ":" + mm + ":" + ss;
        return signDay;
    }

    startTimeHandle(e) {
        let dayStr = this.getDayStr(e._d);
        this.setState({
            starttime: dayStr
        });
    }

    endTimeHandle(e) {
        let dayStr = this.getDayStr(e._d);
        this.setState({
            endtime: dayStr
        });
    }

    renderList() {
        var { searchingText, historyList } = this.props;
        var hist = historyList();
        if (searchingText && hist.length === 0) {
            return (
                <li className={classes.notfound}>
                    {/* <img src="assets/images/crash.png" /> */}
                    <h3>未能找到与关键字 '{searchingText}'相符的消息记录</h3>
                </li>
            );
        }
        return hist.map((e, index) => {
            return (
                <li
                    className={classes.messageItem}
                    key={index}>
                    <div className={classes.username}>{e.displayName}<span>----------{e.dtStr}</span></div>
                    <span
                        className={classes.message}
                        dangerouslySetInnerHTML={{ __html: e.searchableKey }} />
                </li>
            );
        });
    }

    render() {    
        return this.props.show ? (
            <div
                ref="container"
                tabIndex="-1"
                className={clazz(classes.container, classes.show)}
                // onBlur={e => this.props.close()}
            >
                <div className={classes.chathistory}>
                    <div>
                        <input
                        className={classes.chathistoryinput}
                        autoFocus={true}
                        // onInput={e => this.search(e.target.value)}
                        placeholder="在此处输入关键字"
                        ref="input"
                        maxLength="20"
                        type="text" />
                        <button type="button" onClick={e => this.search()}>搜索</button>
                    </div>
                    <div className={classes.timePicker}>
                        <label htmlFor="starttime">开始时间</label>
                            <Datetime inputProps={{ readOnly: true }} dateFormat="YYYY-MM-DD" timeFormat="HH:mm:ss" onChange={(e) => this.startTimeHandle(e)} />
                        <label htmlFor="endtime" style={{marginLeft:'10px'}}>结束时间</label>
                            <Datetime inputProps={{ readOnly: true }} dateFormat="YYYY-MM-DD" timeFormat="HH:mm:ss" onChange={(e) => this.endTimeHandle(e)} />
                    </div>
                </div>
                <ul
                    className={classes.list}
                    ref="list">
                    {this.renderList()}
                </ul>
                <div className={clazz(classes.toast,{[classes.showToast]:this.state.showToast})}>
                    <div className={classes.toastText}>
                        <i className="icon-ion-android-warning"
                            style={{
                                color: "white",
                                fontSize: "16px"
                            }}
                        />
                        {this.state.toastContent}
                    </div>
                </div>
            </div>
        ) : (null);
    }
}
export default onClickOutside(ChatHistory);
