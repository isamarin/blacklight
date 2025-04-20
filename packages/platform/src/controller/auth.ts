import { Msal, TokenStore } from 'xal-node'
import ProxyStore from '../utils/proxystore.js'

export default class authController {
    _tokenStore = new ProxyStore();

    async startMsalAuth() {
        const msal = new Msal(this._tokenStore)
        // return await msal.doDeviceCodeAuth()
        
        return {
            user_code: '111',
            device_code: '222',
            verification_uri: '333',
            expires_in: 900,
            interval: 5,
            message: 'Please go to the verification_uri and enter the user_code',
        }
    }
}