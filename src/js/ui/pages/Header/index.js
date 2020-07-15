import React, { Component } from "react";
import { remote, ipcRenderer } from "../../../platform";
import classes from "./style.css";
import Aside from "../Aside";
import SignBox from "./SignBox";
import { inject, observer } from "mobx-react";

@inject((stores) => ({
    saveSign: stores.chat.saveSign,
    getSignStatus: stores.chat.getSignStatus,
}))
@observer
export default class Header extends Component {
    state = {
        showSignIn: false,
    };
    getTitle() {
        switch (this.props.location.pathname) {
            case "/contacts":
                return "联系人";

            case "/settings":
                return "设置";

            default:
                return "即时通讯";
        }
    }

    // 关闭窗口
    close() {
        ipcRenderer.send("close-window");
    }
    // 最小化窗口
    min() {
        ipcRenderer.send("min-window");
    }
    // 切换窗口状态：如果当前状态是最大化则取消最大化，否则最大化
    toggle() {
        ipcRenderer.send("toggle-max");
    }
    viewremind() {
        //查看提醒
        ipcRenderer.send("open-remindurl");
    }

    viewSignIn() {
        //查看签到面板
        this.setState({
            showSignIn: true,
        });
    }

    closeSignIn() {
        this.setState({
            showSignIn: false,
        });
    }

    saveSign(type, remark) {
        //保存签到
        this.props.saveSign(type, remark);
    }

    render() {
        var isWin = window.process && window.process.platform === "win32";
        var { getSignStatus } = this.props;
        return (
            <header className={classes.container}>
                {/* <h1>{this.getTitle()}</h1> */}
                <h1></h1>

                {isWin && (
                    <div className={classes.head_top}>
                        <p onClick={(e) => this.min()}>一</p>

                        <p onClick={(e) => this.toggle()}>口</p>

                        <p onClick={(e) => this.close()}>X</p>
                    </div>
                )}

                <Aside location={this.props.location} />

                <div className={classes.head_bottom}>
                    <p onClick={(e) => this.viewremind()}>
                        <i
                            className="icon-ion-android-alarm-clock"
                            style={{
                                fontSize: "22px",
                            }}
                        />
                    </p>
                    <p onClick={(e) => this.viewSignIn()}>
                        <i
                            className="icon-ion-android-calendar"
                            style={{
                                fontSize: "22px",
                            }}
                        />
                    </p>
                </div>

                {
                    /* 签到面板 */
                    <SignBox
                        close={(e) => setTimeout(() => this.closeSignIn(), 100)}
                        show={this.state.showSignIn}
                        saveSign={(type, remark) => this.saveSign(type, remark)}
                        getSignStatus={getSignStatus}
                    />
                }
            </header>
        );
    }
}
