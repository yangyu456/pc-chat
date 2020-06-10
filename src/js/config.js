import { isElectron } from './platform'
export default class Config {
    static DEFAULT_PORTRAIT_URL = 'https://static.wildfirechat.cn/user-fallback.png';
    //static APP_SERVER = 'http://wildfirechat.cn:8888';
	static APP_SERVER = 'http://10.4.17.114:8888';
    static QR_CODE_PREFIX_PC_SESSION = "wildfirechat://pcsession/";
    static ICE_ADDRESS = 'turn:turn.wildfirechat.cn:3478';
    static ICE_USERNAME = 'wfchat';
    static ICE_PASSWORD = 'wfchat';
    static LANGUAGE = 'zh_CN';

    static getWFCPlatform() {
        if (isElectron()) {
            if (window.process && window.process.platform === 'darwin') {
                // osx
                return 4;
            } else {
                // windows
                return 3;
            }

        } else {
            // web
            return 5;
        }
    }
}
