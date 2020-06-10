
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
//import { Segment, Input, Button } from 'semantic-ui-react';
//import 'semantic-ui-css/semantic.min.css';
import {ipcRenderer} from 'electron';

import classes from './style.css';
import loginClass from './login.css';
import Config from '../../../config';
import jrQRCode from 'jr-qrcode'
import wfc from '../../../wfc/client/wfc'
import PCSession from '../../../wfc/model/pcsession';
import { observable } from 'mobx';
import axios from 'axios';
import { connect } from '../../../platform'

@inject(stores => ({
    avatar: stores.sessions.avatar,
    code: stores.sessions.code,
}))
@observer
export default class Login extends Component {
    @observable qrCode;
    token = '';
    loginTimer;
    qrCodeTimer;
    lastToken;

    userId;
    username;
    password;

    componentDidMount() {
        axios.defaults.baseURL = Config.APP_SERVER;

        //this.getCode();
        //this.keepLogin();
        //this.refreshQrCode();
    }

    componentWillUnmount() {
        console.log('login will disappear');
        //clearInterval(this.loginTimer);
        //clearInterval(this.qrCodeTimer);
    }

    renderUser() {
        return (
            <div className={classes.inner}>
                {
                    <img
                        className="disabledDrag"
                        src={this.props.avatar} />
                }

                <p>Scan successful</p>
                <p>Confirm login on mobile WildfireChat</p>
            </div>
        );
    }

    async getCode() {
        var response = await axios.post('/pc_session', {
            token: this.token,
            device_name: 'pc',
            clientId: wfc.getClientId(),
            platform: Config.getWFCPlatform()
        });
        console.log('----------- getCode', response.data);
        if (response.data) {
            let session = Object.assign(new PCSession(), response.data.result);
            this.token = session.token;
            this.qrCode = jrQRCode.getQrBase64(Config.QR_CODE_PREFIX_PC_SESSION + session.token);
        }
    }

    async keepLogin() {
        this.loginTimer = setInterval(() => {
            this.login();
        }, 1 * 1000);
    }

    async refreshQrCode() {
        this.qrCodeTimer = setInterval(() => {
            this.token = '';
            this.getCode();
        }, 30 * 1000);
    }
    async login() {
        if (this.token === '' || this.lastToken === this.token) {
            console.log('-------- token is empty or invalid');
            return;
        }
        var response = await axios.post('/session_login/' + this.token);
        console.log('---------- login', response.data);
        if (response.data) {
            switch (response.data.code) {
                case 0:
                    this.lastToken = this.token;
                    let userId = response.data.result.userId;
                    let token = response.data.result.token;
                    connect(userId, token);
                    break;
                default:
                    this.lastToken = '';
                    console.log(response.data);
                    break
            }
        }
    }

    constructor(props) {  //构造函数
        super(props);
        this.state = {
            username:'',
            password:''
        }
        this.usernameChange = this.usernameChange.bind(this);
        this.passwordChange = this.passwordChange.bind(this);
        this.loginAccount = this.loginAccount.bind(this);
        this.resetValue = this.resetValue.bind(this);
    }

    usernameChange(e){
        this.setState({ username : e.target.value })
    }

    passwordChange(e){
        this.setState({ password : e.target.value })
    }

    resetValue(e){
        this.setState({ username : '',password:'' })
    }

    async loginAccount() {
        var uname = document.getElementById('username').value;
        var pwd = document.getElementById('password').value;
        if (uname === '' || pwd === '') {
            console.log('-------- username is empty or password is empty');
            return;
        }
        var response = await axios.post('/loginByAccount', {
            username: uname,
            password: pwd,
            clientId: wfc.getClientId(),
            platform: Config.getWFCPlatform()
        });
        console.log('---------- loginAccount', response.data);
        if (response.data) {
            switch (response.data.code) {
                case 0:
                    this.lastToken = this.token;
                    let userId = response.data.result.userId;
                    let token = response.data.result.token;

                    ipcRenderer.send('get-userinfo', {
                        userinfo: response.data.result,
                        baseURL: Config.APP_SERVER
                    });

                    connect(userId, token);
                    break;
                default:
                    this.lastToken = '';
                    console.log(response.data);
                    document.getElementById('errormsg').innerHTML='<font color="red">登录失败，账号或密码错误!</font>';
                    break
            }
        }
    }

    renderCode() {

        return (
            <div className={classes.inner}>
                {
                    this.qrCode && (<img className="disabledDrag" src={this.qrCode} />)
                }

                <a href={window.location.pathname + '?' + +new Date()}>刷新二维码</a>

                <p>扫码登录野火IM</p>
            </div>
        );
    }

    renderLoginAccount() {

        return (

            <div style={{border:'0px #0376C2 solid',width:'380px',height:'460px',margin:'20px auto'}} >
                <form>
                    <div align="center" style={{marginTop:'50px'}}>
                        <div className={loginClass.logo_div}>
                            <img src={require('./img/logo.png')} width="80" style={{marginTop:'20px'}} />
                        </div>
                        <div className={loginClass.logo_title}>即时通讯系统</div>
                    </div>
                    <div style={{marginTop:'20px'}}></div>
                    <table className={loginClass.login_table} style={{margin:'0 auto',width:'300px'}} >
                        <tr>
                            <td width="40px"><img src={require('./img/login_user.png')} width="30" align="middle" /></td>
                            <td><input type="text" placeholder="请输入账号" id='username' name='username'
                                onChange={this.usernameChange} />
                            </td>
                        </tr>
                        <tr><td colspan="2">&nbsp;</td></tr>
                        <tr>
                            <td><img src={require('./img/login_pwd.png')} width="30" align="middle" /></td>
                            <td><input type="password" placeholder="请输入密码" id='password' name='password'
                                onChange={this.passwordChange}/>
                            </td>
                        </tr>
                        <tr><td colspan="2" id='errormsg' align="center">&nbsp;</td></tr>
                        <tr>
                            <td>&nbsp;</td>
                            <td><button className={loginClass.login_btn} onClick={this.loginAccount}>登&nbsp;&nbsp;&nbsp;录</button></td>
                        </tr>
                    </table>
                </form>
            </div>
        );
    }

    render() {
        return (
            <div className={classes.container}>
                {
                    // this.props.avatar ? this.renderUser() : this.renderCode()
                    //this.renderCode()

                    this.renderLoginAccount()
                }
            </div>
        );
    }
}