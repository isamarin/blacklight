import { xHomeToken } from '../types/webtoken'
import { TRPCError } from '@trpc/server'
import Http from '../lib/http.js'

export default class gamepassController {
    private _httpClient = new Http()

    private _sigls = {
        new: 'f13cf6b4-57e6-4459-89df-6aec18cf0538'
    }

    async getTitles(token:xHomeToken) {
        if(token.token === '') {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: '(xHomeToken) No correct token provided',
            });
        }

        const titles = await this._httpClient.getRequest('weu.core.gssv-play-prod.xboxlive.com', '/v2/titles', {
            'Authorization': `Bearer ${token.token}`,
        })
        
        return titles
    }

    async getRecentTitles(token:xHomeToken) {
        if(token.token === '') {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: '(xHomeToken) No correct token provided',
            });
        }

        const titles = await this._httpClient.getRequest('weu.core.gssv-play-prod.xboxlive.com', '/v2/titles/mru?mr=25', {
            'Authorization': `Bearer ${token.token}`,
        })
        
        return titles
    }

    async getNewTitles(token:xHomeToken) {
        if(token.market === '' || token.token === '' || token.language === '') {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: '(xHomeToken) No correct token provided',
            });
        }

        const titles = await this._httpClient.getRequest('catalog.gamepass.com', '/sigls/v2?id='+this._sigls.new+'&market='+token.market+'&language='+token.language, {
            'Authorization': `Bearer ${token.token}`,
        })
        
        return titles
    }

    async resolveTitles(token:xHomeToken, productIds:string[]) {
        if(token.market === '' || token.token === '' || token.language === '') {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: '(xHomeToken) No correct token provided',
            });
        }

        const result = await this._httpClient.postRequest('catalog.gamepass.com', `/v3/products?hydration=RemoteHighSapphire0&market=${token.market}&language=${token.language}`, {
            'Authorization': `Bearer ${token.token}`,
            'ms-cv': '0.0',
            'calling-app-name': 'Greenlight',
            'calling-app-version': '3.0.0',
        },{
            Products: productIds,
        })

        return result
    }

    async resolveTitle(token:xHomeToken, productId:string) {
        return (await this.resolveTitles(token, [productId]))
    }
}