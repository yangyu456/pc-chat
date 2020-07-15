import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clazz from 'classname';
import classes from './style.css';
import onClickOutside from "react-onclickoutside";
import { observer } from 'mobx-react';

@observer
export class QuickSendList extends Component {
    //定义参数的类型 func方法 array数组
    static propTypes = {
        show: PropTypes.bool.isRequired,
        close: PropTypes.func.isRequired,
        getList: PropTypes.func.isRequired,
        outputQuickSend: PropTypes.func.isRequired,
        openQuickSetting: PropTypes.func.isRequired
    };

    state = {
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    handleClickOutside = evt => {
        this.props.close();
    }

    output(message) {
        // console.log(message);
        this.props.outputQuickSend(message);
    }

    openSetting() {
        // 打开快捷回复设置
        this.props.openQuickSetting();
    }

    renderList = () => {
        var { getList} = this.props;
        var list = getList();
        return list.map((e,index) => {
            return (
                !e.message ? 
                (null):
                (<li onClick={() => this.output(e.message)} key={e.command}>{e.message}</li>)
            )
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
                <div className={clazz(classes.quicksend)}>
                    <ul>
                        {this.renderList()}
                    </ul>
                    <p style={{cursor: "pointer"}} onClick={() => this.openSetting()}>进行快捷回复设置
                    <i
                        className="icon-ion-android-settings"
                        style={{
                            color: "#999999",
                            fontSize: "15px",
                            marginLeft: "5px"
                        }}
                    />
                    </p>
                </div>
            </div>
        ) :
         (null);
    }
}
export default onClickOutside(QuickSendList);
