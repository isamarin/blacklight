import { Msal } from 'xal-node'
import ProxyStore from '../utils/proxystore.js'
import { IUserToken } from 'xal-node/dist/lib/tokens/usertoken.js'

export default class authController {

    async startMsalAuth() {
        const tokenStore = new ProxyStore();
        const msal = new Msal(tokenStore)
        return await msal.doDeviceCodeAuth()
    }

    async verifyDeviceCode(devicecode:string, timeout?:number) {
        const tokenStore = new ProxyStore();
        const msal = new Msal(tokenStore)
        return await msal.doPollForDeviceCodeAuth(devicecode, timeout)
    }

    async getStreamingTokens(json_token:string) {
        const token = JSON.parse(json_token) as IUserToken
        
        const tokenStore = new ProxyStore(token);
        const msal = new Msal(tokenStore)
        return await msal.getStreamingTokens()
    }

    async getWebToken(json_token:string) {
        const token = JSON.parse(json_token) as IUserToken

        const tokenStore = new ProxyStore(token);
        const msal = new Msal(tokenStore)
        return await msal.getWebToken()
    }
}