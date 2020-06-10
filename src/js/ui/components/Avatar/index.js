
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './style.global.css';

export default class Avatar extends Component {
    static propTypes = {
        src: PropTypes.string,
        fallback: PropTypes.string,
    };

    static defaultProps = {
        fallback: 'assets/images/user-fallback.png',
    };

    // 获取目标对象身上的src属性的值,结尾是否包含以下字符串,判断true或false,没包含就赋值
    handleError(e) {
        if(!e.target.src.endsWith(this.props.fallback)){
        e.target.src = this.props.fallback;
        }
    }

    handleLoad(e) {
        e.target.classList.remove('fadein');
    }

    render() {
        if (!this.props.src) return false;

        return (
            <img
                className={`Avatar fade fadein ${this.props.className}`}
                onClick={this.props.onClick}
                onLoad={e => this.handleLoad(e)}
                onContextMenu={this.props.onContextMenu}
                onError={e => this.handleError(e)}
                src={this.props.src}
            />
        );
    }
}
