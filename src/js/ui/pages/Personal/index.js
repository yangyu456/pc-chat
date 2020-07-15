import React, { Component, useState } from "react";
import { ipcRenderer } from "electron";
import { inject, observer } from "mobx-react";
import axios from "axios";
import wfc from "../../../wfc/client/wfc";
import classes from "./style.css";
// import "antd/dist/antd.css";
import { Upload, message } from "antd";
import ImgCrop from "antd-img-crop";
import "!style-loader!css-loader!./index.css";
import "!style-loader!css-loader!./model1.css";
import "!style-loader!css-loader!./slider1.css";
import "!style-loader!css-loader!./message1.css";
import MessageContentMediaType from "../../../wfc/messages/messageContentMediaType";
import ModifyMyInfoType from "../../../wfc/model/modifyMyInfoType";
function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
}
export default class Personal extends Component {
    // 原型对象的构造函数 p.prototype.constructor
    constructor(props) {
        // 写了constructor，就必须写super(),此时组件才有自己的this
        super(props);
        // props 参数是为了使用this.props
        this.state = {
            displayName: "",
            nickName: "",
            email: "",
            signature: "",
            imageUrl: "",
        };
    }
    // 上传文件前的判断
    beforeUpload(file) {
        // console.log("beforeUpload", file);
        const isJpgOrPng =
            file.type === "image/jpeg" ||
            file.type === "image/png" ||
            file.type === "image/jpg" ||
            file.type === "image/bmp";
        if (!isJpgOrPng) {
            message.error("请上传 JPG/PNG/BMP 格式头像");
        }
        let isLt2M = file.size < 50000;
        // console.log("fileSize---" + file.size);
        // console.log("isLt2m----" + isLt2M);
        if (!isLt2M) {
            message.error("图片必须小于 100KB 哦！");
        }
        return isJpgOrPng && isLt2M;
    }

    //上传文件改动的事件
    onChange(newFileList) {
        // console.log("newFileList=====================", newFileList);
        if (newFileList.file.status === "done") {
            getBase64(newFileList.file.originFileObj, (imageUrl) => {
                this.setState({
                    imageUrl: imageUrl,
                });
                // console.log(
                //     " this.state.imageUrl=========================",
                //     this.state.imageUrl
                // );
                wfc.uploadMedia(
                    "portrait",
                    this.state.imageUrl,
                    MessageContentMediaType.Portrait,
                    (remoteUrl) => {
                        this.uploadTrait(remoteUrl);
                    },
                    (errorCode) => {},
                    (current, total) => {
                        // do nothing
                    }
                );
            });
        }
    }
    // 将BASE64字符串上传到服务器
    async uploadTrait(remoteUrl) {
        var response = await axios.post("/updateUserInfo", {
            userId: wfc.getUserId(),
            portrait: remoteUrl,
        });
        if (response.data) {
            switch (response.data.code) {
                case 0:
                    break;
                default:
                    break;
            }
        }
        // console.log("上传服务器的图片====================", remoteUrl);
        wfc.modifyMyInfo(
            ModifyMyInfoType.Modify_Portrait,
            remoteUrl,
            (res) => {
                // console.log("成功===================", res);
                wfc.getUserInfo(wfc.getUserId(), true);
            },
            (errorCode) => {
                // console.log("失败===================", errorCode);
            }
        );
        // 回显
        this.getUserInfo();
    }

    // 进入页面就获取用户信息
    async getUserInfo() {
        var response = await axios.post("/getUserInfo", {
            userId: wfc.getUserId(),
            clientId: wfc.getClientId(),
        });
        // console.log("---------- getUserInfo", response.data.result);
        if (response.data) {
            // console.log(response.data.result.portrait);
            switch (response.data.code) {
                case 0:
                    this.setState({
                        imageUrl: response.data.result.portrait,
                        displayName: response.data.result.displayName,
                        nickName: response.data.result.nickName,
                        email: response.data.result.email,
                        signature: response.data.result.signature,
                    });

                    break;
                default:
                    //console.log(response.data);
                    break;
            }
        }
    }

    // 点击保存
    async savePersonalInfo() {
        var displayName = document.getElementById("displayName").value;
        var nickName = document.getElementById("nickName").value;
        var email = document.getElementById("email").value;
        var signature = document.getElementById("signature").value;

        if (
            !/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,10}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,10}[a-zA-Z0-9])?)*$/.test(
                email
            )
        ) {
            // console.log("请输入正确格式的Email");
            document.getElementById("errormsg").innerHTML =
                '<font color="blue">请输入正确格式的Email</font>';
            return false;
        }

        var response = await axios.post("/updateUserInfo", {
            // portrait: portrait,
            displayName: displayName,
            nickName: nickName,
            email: email,
            signature: signature,
            userId: wfc.getUserId(),
            clientId: wfc.getClientId(),
        });
        // console.log("---------- savePersonalInfo", response.data);
        if (response.data) {
            switch (response.data.code) {
                case 0:
                    // console.log(response.data);
                    document.getElementById("errormsg").innerHTML =
                        '<font color="blue">保存成功</font>';
                    break;
                default:
                    // console.log(response.data);
                    document.getElementById("errormsg").innerHTML =
                        '<font color="red">保存失败</font>';
                    break;
            }
        }
    }

    // 在第一次渲染后调用，之后组件已经生成了对应的DOM结构
    componentDidMount() {
        this.getUserInfo();
    }

    handelChange(e) {
        this.setState({
            [e.target.name]: e.target.value,
        });
    }

    handleEmail(value) {
        // 字符串是否匹配，true或false
        if (
            !/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,10}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,10}[a-zA-Z0-9])?)*$/.test(
                value
            )
        ) {
            // console.log("请输入正确格式的Email");
            document.getElementById("errormsg").innerHTML =
                '<font color="blue">请输入正确格式的Email</font>';
            return false;
        }

        return true;
    }

    render() {
        const modelSize = {
            //裁剪宽度
            width: 200,
            //裁剪高度
            height: 200,
            //弹窗宽度
            // modalWidth: 200,
            modalHeight: 200,
            modalTitle: "编辑头像",
            modalOk: "确定",
            modalCancel: "取消",
        };
        return (
            <div className={classes.container}>
                <div className={classes.column}>
                    <h2>个人信息设置</h2>
                    <ul>
                        <li>
                            <ImgCrop {...modelSize}>
                                <Upload
                                    action="http://10.4.17.114:8888/modifyUserInfo"
                                    listType="picture-card"
                                    beforeUpload={(e) => this.beforeUpload(e)}
                                    // 是否展示文件列表
                                    showUploadList={false}
                                    // 上传文件改变时的状态
                                    onChange={(e) => this.onChange(e)}
                                >
                                    {this.state.imageUrl ? (
                                        <img
                                            src={this.state.imageUrl}
                                            alt="avatar"
                                            style={{ width: "100%" }}
                                        />
                                    ) : (
                                        "上传头像"
                                    )}
                                </Upload>
                            </ImgCrop>
                        </li>
                        <li>
                            {/* 关联input并扩大点击区域 */}
                            <label htmlFor="displayName">
                                <span>姓名</span>
                                <input
                                    type="text"
                                    id="displayName"
                                    name="displayName"
                                    value={this.state.displayName}
                                    // input发生改变的时候绑定this
                                    onChange={this.handelChange.bind(this)}
                                    maxLength="20"
                                ></input>
                            </label>
                        </li>
                        <li>
                            <label htmlFor="nickName">
                                <span>昵称</span>
                                <input
                                    type="text"
                                    id="nickName"
                                    name="nickName"
                                    value={this.state.nickName}
                                    onChange={this.handelChange.bind(this)}
                                    maxLength="20"
                                ></input>
                            </label>
                        </li>
                        <li>
                            <label htmlFor="email">
                                <span>邮箱</span>
                                <input
                                    type="text"
                                    id="email"
                                    name="email"
                                    value={this.state.email}
                                    onChange={this.handelChange.bind(this)}
                                    maxLength="20"
                                ></input>
                            </label>
                        </li>
                        <li>
                            <label htmlFor="signature">
                                <span style={{ alignSelf: "flex-start" }}>
                                    个人签名
                                </span>
                                <textarea
                                    rows="5"
                                    cols="20"
                                    id="signature"
                                    name="signature"
                                    value={this.state.signature}
                                    onChange={this.handelChange.bind(this)}
                                    maxLength="50"
                                ></textarea>
                            </label>
                        </li>
                        <li>
                            <table>
                                <tbody>
                                    <tr>
                                        <td
                                            colSpan="2"
                                            id="errormsg"
                                            align="center"
                                        >
                                            &nbsp;
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </li>
                        <li>
                            <label htmlFor="saveInfo">
                                <span></span>
                                <button
                                    id="saveInfo"
                                    onClick={this.savePersonalInfo}
                                    style={{ backgroundColor: "#3D6EDD" }}
                                >
                                    保&nbsp;&nbsp;存
                                </button>
                            </label>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}
