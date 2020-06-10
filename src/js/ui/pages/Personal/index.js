import React, { Component } from 'react';
import {ipcRenderer} from 'electron';
import { inject, observer } from 'mobx-react';
import axios from 'axios';
import wfc from '../../../wfc/client/wfc';
import classes from './style.css';

export default class Personal extends Component {

    constructor(props){
        super(props);
        this.state = {
            displayName:'',
            nickName:'',
            email:'',
            signature:''
        }
    }

    async getUserInfo(){
        var response = await axios.post('/getUserInfo', {
            userId: wfc.getUserId(),
            clientId: wfc.getClientId()
        });

        //console.log('---------- getUserInfo', response.data);
        //console.log('---------- getUserInfo', response.data.result);
        if (response.data) {
            switch (response.data.code) {
                case 0:
                    this.setState({
                        displayName:response.data.result.displayName,
                        nickName:response.data.result.nickName,
                        email:response.data.result.email,
                        signature:response.data.result.signature
                    });

                    break;
                default:
                    //console.log(response.data);
                    break
            }
        }
    }

    async savePersonalInfo() {
        var displayName = document.getElementById('displayName').value;
        var nickName = document.getElementById('nickName').value;
        var email = document.getElementById('email').value;
        var signature = document.getElementById('signature').value;
        
        if(!(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,10}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,10}[a-zA-Z0-9])?)*$/.test(email))) {
            console.log('请输入正确格式的Email');
            document.getElementById('errormsg').innerHTML='<font color="blue">请输入正确格式的Email</font>';
            return false;
        }
        
        var response = await axios.post('/updateUserInfo', {
            displayName: displayName,
            nickName: nickName,
            email: email,
            signature: signature,
            userId: wfc.getUserId(),
            clientId: wfc.getClientId()
        });
        console.log('---------- savePersonalInfo', response.data);
        if (response.data) {
            switch (response.data.code) {
                case 0:
                    console.log(response.data);
                    document.getElementById('errormsg').innerHTML='<font color="blue">保存成功</font>';
                    break;
                default:
                    console.log(response.data);
                    document.getElementById('errormsg').innerHTML='<font color="red">保存失败</font>';
                    break
            }
        }
    }

    componentDidMount() {
        this.getUserInfo();
    }

    handelChange(e){
		this.setState({
			[e.target.name]:e.target.value
		})
    }
    
    handleEmail (value) {
        if(!(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,10}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,10}[a-zA-Z0-9])?)*$/.test(value))) {
            console.log('请输入正确格式的Email');
            document.getElementById('errormsg').innerHTML='<font color="blue">请输入正确格式的Email</font>';
            return false;
        }

        return true;
    }

    render(){
        return (
            <div className={classes.container}>
                <div className={classes.column}>
                    <h2>个人信息设置</h2>
                    <ul>
                        <li>
                            <label htmlFor='displayName'>
                                <span>姓名</span>
                                <input type='text' id='displayName' name='displayName' value={this.state.displayName}
                                onChange={this.handelChange.bind(this)} maxLength='20'></input>
                            </label>
                        </li>
                        <li>
                            <label htmlFor='nickName'>
                                <span>昵称</span>
                                <input type='text' id='nickName' name='nickName' value={this.state.nickName}
                                onChange={this.handelChange.bind(this)} maxLength='20'></input>
                            </label>
                        </li>
                        <li>
                            <label htmlFor='email'>
                                <span>邮箱</span>
                                <input type='text' id='email' name='email' value={this.state.email}
                                onChange={this.handelChange.bind(this)} maxLength='20'></input>
                            </label>
                        </li>
                        <li>
                            <label htmlFor='signature'>
                                <span>个人签名</span>
                                <textarea rows="5" cols="20" id='signature' name='signature' value={this.state.signature}
                                onChange={this.handelChange.bind(this)} maxLength='50'></textarea>
                            </label>
                        </li>
                        <li><table><tr><td colspan="2" id='errormsg' align="center">&nbsp;</td></tr></table></li>
                        <li>
                            <button onClick={this.savePersonalInfo} style={{backgroundColor:'#3D6EDD'}}>保&nbsp;&nbsp;存</button>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
}