
import React, { Component } from 'react';
import { Modal, ModalBody } from 'components/Modal';
import { inject, observer } from 'mobx-react';

import classes from './style.css';
import UserList from 'components/UserList';
import wfc from '../../../wfc/client/wfc'
import UserInfo from '../../../wfc/model/userInfo';

@inject(stores => ({
    show: stores.forward.show,
    searching: stores.forward.query,
    getList: () => {
        var { forward, contacts } = stores;

        if (forward.query) {
            return forward.list;
        }

        if(contacts.memberList.length === 0){
            contacts.getContacts();
        }
        return contacts.memberList.filter(e => {
            if (e instanceof UserInfo) {
                return e.uid !== wfc.getUserId()
            }
            return true;
        });
    },
    getUser: (userid) => {
        return stores.contacts.memberList.find(e => e.uid === userid);
    },
    search: stores.forward.search,
    send: (userids) => stores.forward.send(userids),
    close: () => stores.forward.toggle(false),
}))
@observer
export default class Forward extends Component {
    state = {
        selected: [],
    };

    close() {
        this.props.close();
        this.setState({
            selected: [],
        });
    }

    send(userids) {
        userids.map(e => {
            this.props.send(e);
        });
        this.close();
    }

    renderList() {
        var self = this;
        var { show, searching, search, getList } = this.props;

        if (!show) {
            return false;
        }

        return (
            <UserList {...{
                ref: 'users',

                search,
                getList,
                searching,
                max: -1,

                onChange(selected) {
                    self.setState({
                        selected,
                    });
                }
            }} />
        );
    }

    render() {
        return (
            <Modal
                fullscreen={true}
                onCancel={e => this.close()}
                show={this.props.show}>
                <ModalBody className={classes.container}>
                    转发消息

                    <div className={classes.avatars}>
                        {
                            this.state.selected.map((e, index) => {
                                var user = this.props.getUser(e);
                                return (
                                    <img
                                        key={index}
                                        onClick={ev => this.refs.users.removeSelected(e)}
                                        src={user.portrait} />
                                );
                            })
                        }
                    </div>

                    {this.renderList()}

                    <div>
                        <button
                            disabled={!this.state.selected.length}
                            onClick={e => this.send(this.state.selected)}>
                            转发消息
                        </button>

                        <button onClick={e => this.close()}>取消</button>
                    </div>
                </ModalBody>
            </Modal>
        );
    }
}
