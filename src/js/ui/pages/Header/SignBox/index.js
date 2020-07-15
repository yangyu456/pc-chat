
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clazz from 'classname';
import classes from './style.css';
import onClickOutside from "react-onclickoutside";
import { Radio } from 'antd';

export class SignBox extends Component {
    static propTypes = {
        show: PropTypes.bool.isRequired,
        close: PropTypes.func.isRequired,
        saveSign: PropTypes.func.isRequired,
        getSignStatus: PropTypes.func.isRequired
    };

    state = {
        signValue: "1",
        signState: {
            flag: false,
            signInTimeStr: "",
            signType: ""
        }
    }

    componentDidMount() {
        this.updateStatus();
    }

    componentWillUnmount() {
    }

    handleClickOutside = evt => {
        // ..handling code goes here...
        this.props.close();
    };

    handleChange = e => {
        this.setState({
            signValue: e.target.value
        });
    }

    updateStatus() {
        var { getSignStatus } = this.props;
        getSignStatus().then((res) => {
            this.setState({
                signState: res
            })
        });
    }

    handleSign() {
        // console.log(this.state.signValue);
        let type = this.state.signValue;
        let remark = this.refs.signremark.value;
        this.props.saveSign(type, remark);
        this.props.close();
        setTimeout(() => {
            this.updateStatus();
        },200);
    }

    render() {
        var signState = this.state.signState;
        return this.props.show ? (
            <div
                ref="container"
                tabIndex="-1"
                className={clazz(classes.container, classes.show)}
            >
                <p>签到面板</p>
                {signState.flag ? (
                    <div className={classes.signBox}>
                        <p style={{width:'100%',textAlign:'center',fontSize:'20px',color:'#409FFF'}}>您今日已经签到过了。</p>
                        <p style={{width:'100%',textAlign:'center',fontSize:'16px'}}>签到时间: {signState.signInTimeStr}</p>
                        <p style={{width:'100%',textAlign:'center',fontSize:'16px'}}>签到类型: {signState.signType}</p>
                    </div>
                ):(
                    <form className={classes.signBox}>
                        <label htmlFor="jujia">
                            居家：
                            <input
                                id="jujia"
                                type="radio"
                                value="1"
                                name="sign"
                                defaultChecked
                                onChange={this.handleChange}/>
                        </label>
                        <label htmlFor="xianchang" style={{'marginLeft':'20px'}}>
                            现场：
                            <input
                                id="xianchang"
                                type="radio"
                                value="2"
                                name="sign"
                                onChange={this.handleChange}/>
                        </label>
                        <div>
                            <textarea ref="signremark" rows="6" placeholder="签到备注（选填）"></textarea>
                        </div>
                        <div>
                            <button type="button" onClick={(e) => this.handleSign(e)}>签到</button>
                        </div>
                    </form>
                )}
                
            </div>
        ) : (null);
    }
}
export default onClickOutside(SignBox);
