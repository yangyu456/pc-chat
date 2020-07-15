
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clazz from 'classname';
import classes from './style.css';
import onClickOutside from "react-onclickoutside";

export class Hist extends Component {
    //定义参数的类型 func方法 array数组
    static propTypes = {
        show: PropTypes.bool.isRequired,
        close: PropTypes.func.isRequired,
        HistDate: PropTypes.object.isRequired,
    };

    state = {
        Hist: this.props.HistDate
    }

    componentDidMount() {
        
    }

    getList() {
        var list = this.state.Hist.key;
    }

    componentWillUnmount() {
    }

    handleClickOutside = evt => {
        // ..handling code goes here...
        this.props.close();
    }
    render() {
        return this.props.show ? (
            <div
                ref="container"
                className={clazz(classes.container, classes.show)}
                // onBlur={e => this.props.close()}
            >
                <div className={clazz(classes.quicksend)}>
                    <div className={clazz(classes.control)}>
                       {this.getList()}
                    </div>
                    <div className={clazz(classes.content)}>
                    </div>
                    <div className={clazz(classes.btnGroup)}>
                        <button type="button" onClick={this.saveQuickSend}>保存</button>
                        <button type="button" onClick={this.onQuickClose}>关闭</button>
                    </div>
                </div>
            </div>
        ) : (null);
    }
}
export default onClickOutside(Hist);
