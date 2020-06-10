
import React, { Component } from 'react';
import { render } from 'react-dom';
import { Provider } from 'mobx-react';
import { HashRouter } from 'react-router-dom';
import { ipcRenderer, remote } from 'electron';

import './global.css';
import './assets/fonts/icomoon/style.css';
import 'utils/albumcolors';
import getRoutes from './js/ui/routes';
import stores from './js/ui/stores';

var sharedObj = remote.getGlobal('sharedObj');

export default class App extends Component {
    async componentWillMount() {
        if (window.navigator.onLine) {
            // await stores.sessions.hasLogin();
            // await stores.settings.init();
            // await stores.search.getHistory();
            await stores.wfc.init([sharedObj.proto]);
        }
    }

    canisend() {
        return this.refs.navigator.history.location.pathname === '/'
            && stores.chat.user;
    }

    componentDidMount() {
        var navigator = this.refs.navigator;

        // Hide the tray icon 隐藏托盘图标
        ipcRenderer.on('hide-tray', () => {
            stores.settings.setShowOnTray(false);
        });

        // Chat with user 与用户聊天
        ipcRenderer.on('message-chatto', (event, args) => {
            var user = stores.contacts.memberList.find(e => e.UserName === args.id);

            navigator.history.push('/');
            setTimeout(stores.chat.chatTo(user));
        });

        // Show the user info 显示用户信息
        ipcRenderer.on('show-userinfo', (event, args) => {
            var user = stores.contacts.memberList.find(e => e.UserName === args.id);
            stores.userinfo.toggle(true, user);
        });

        // Shwo the personal page 注意个人页面
        ipcRenderer.on('show-personal', () => {
            navigator.history.push('/personal');
        });

        // Shwo the settings page 设置页面
        ipcRenderer.on('show-settings', () => {
            navigator.history.push('/settings');
        });

        // Show a modal to create a new conversation 显示创建新对话的模式
        ipcRenderer.on('show-newchat', () => {
            navigator.history.push('/');
            stores.newchat.toggle(true);
        });

        // Show the conversation pane 显示对话窗格
        ipcRenderer.on('show-conversations', () => {
            if (this.canisend()) {
                stores.chat.toggleConversation();
            }
        });

        // Search in currently conversation list 搜索当前对话列表
        ipcRenderer.on('show-search', () => {
            navigator.history.push('/');
            stores.chat.toggleConversation(true);

            setTimeout(() => document.querySelector('#search').focus());
        });

        // Show the home page 显示主页
        ipcRenderer.on('show-messages', () => {
            navigator.history.push('/');
            stores.chat.toggleConversation(true);
        });

        // Insert the qq emoji 插入qq表情
        ipcRenderer.on('show-emoji', () => {
            if (this.canisend()) {
                document.querySelector('#showEmoji').click();
            }
        });

        // Show contacts page 显示联系人页
        ipcRenderer.on('show-contacts', () => {
            navigator.history.push('/contacts');
        });

        // Go to next conversation 转到下一个话题
        ipcRenderer.on('show-next', () => {
            navigator.history.push('/');
            stores.chat.toggleConversation(true);
            setTimeout(stores.chat.chatToNext);
        });

        // Go to the previous conversation 回到之前的对话
        ipcRenderer.on('show-previous', () => {
            navigator.history.push('/');
            stores.chat.toggleConversation(true);
            setTimeout(stores.chat.chatToPrev);
        });

        // When the system resume reconnet to WeChat 当系统恢复恢复到微信时
        ipcRenderer.on('os-resume', async () => {
            var sessions = stores.sessions;

            console.log('os-resume' + new Date());
            setTimeout(() => {
                sessions.checkTimeout(true);
            }, 3000);
        });

        // Show the daemon error 显示守护进程错误
        ipcRenderer.on('show-errors', (event, args) => {
            stores.snackbar.showMessage(args.message);
        });
    }

    render() {
        return (
            <Provider {...stores}>
                <HashRouter ref="navigator">
                    {getRoutes()}
                </HashRouter>
            </Provider>
        );
    }
}

// render(
//     <App />,
//     document.getElementById('root')
// );

module.exports = App
