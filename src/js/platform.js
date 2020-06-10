import wfc from "./wfc/client/wfc";

export function isElectron() {
    // Renderer process
    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        return true;
    }

    // Main process
    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
        return true;
    }

    // Detect the user agent when the `nodeIntegration` option is set to true
    if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
        return true;
    }

    return false;
}

// 后两个参数是针对web的
export function popMenu(templates, data, menuId) {
    if (isElectron()) {
        let menu;
        menu = new remote.Menu.buildFromTemplate(templates);
        menu.popup(remote.getCurrentWindow());
    } else {
        return showBrowserMenu(templates, data, menuId);
    }
}

export function showBrowserMenu(menuTemplates = [], data, menuId) {
    let items = menuTemplates.map((template) => {
        return (
            <MenuItem data={{ data: data }} onClick={template.click}>
                {template.label}
            </MenuItem>
        );
    });
    return (
        <ContextMenu id={menuId} >
            {
                items
            }
        </ContextMenu>
    );
}

export function connect(userId, token) {
    wfc.connect(userId, token);
}

// pc
export const remote = require('electron').remote;
export const ipcRenderer = require('electron').ipcRenderer;
export const ipcMain = require('electron').ipcMain;
export const fs = require('file-system').fs;
export const currentWindow = require('electron').remote.getCurrentWindow();
export const BrowserWindow = require('electron').remote.BrowserWindow;
export const AppPath = require('electron').remote.app.getAppPath();

// for web
export const ContextMenuTrigger = null;
export function hideMenu() { }
export const PostMessageEventEmitter = null;
