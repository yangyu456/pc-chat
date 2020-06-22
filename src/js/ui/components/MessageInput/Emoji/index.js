
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clazz from 'classname';
import data from './google.json'
import classes from './style.css';
// import { Picker } from 'emoji-mart'
import Picker from 'emoji-picker-react';
import onClickOutside from "react-onclickoutside";

export class Emoji extends Component {
    static propTypes = {
        output: PropTypes.func.isRequired,
        show: PropTypes.bool.isRequired,
        close: PropTypes.func.isRequired,
    };

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    handleClickOutside = evt => {
        // ..handling code goes here...
        this.props.close();
    };

    onEmojiSelect = (event,emoji) => {
        console.log('onEmojiSelect', emoji);
        // this.props.output(emoji.native);
        this.props.output(emoji.emoji);
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
                {/* <Picker set='emojione'
                    ref='emojiPicker'
                    onClick={this.onEmojiSelect}
                    // onSelect={this.onEmojiSelect}
                    title='WFC Emoji'
                    showPreview={false}
                    showSkinTones={false}
                    emojiTooltip={false}
                /> */}
                <Picker
                    groupNames={{
                        smileys_people: '经典',
                        animals_nature: '动物',
                        food_drink: '食物',
                        travel_places: '环球',
                        activities: '运动',
                        objects: '常用物品',
                        symbols: '标志',
                        flags: '旗帜',
                        recently_used: '最近使用'
                    }}
                    disableSearchBar={true}
                 onEmojiClick={this.onEmojiSelect} />
            </div>
        ) : (null);
    }
}
export default onClickOutside(Emoji);
