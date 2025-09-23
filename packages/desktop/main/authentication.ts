import { session, dialog } from 'electron'
import { createWindow } from './helpers'
import Application from './application'
import { Xal } from 'xal-node'
import AuthTokenStore from './helpers/tokenstore'
import i18n from 'i18next';


export default class Authentication {
    _application:Application

    _tokenStore:AuthTokenStore
    _xal:Xal

    _authWindow
    _authCallback

    _isAuthenticating:boolean = false
    _isAuthenticated:boolean = false
    _appLevel:number = 0

    private t = i18n.t.bind(i18n);

    constructor(application:Application){
        this._application = application
        this._tokenStore = new AuthTokenStore()
        this._tokenStore.load()
        this._xal = new Xal(this._tokenStore)
    }

    checkAuthentication(){
        this._application.log('authenticationV2', '[checkAuthentication()] Starting token check...')
        if(this._tokenStore.hasValidAuthTokens()){
            this._application.log('authenticationV2', '[checkAuthentication()] Tokens are valid.')
            this.startSilentFlow()

            return true

        } else {
            if(this._tokenStore.getUserToken() !== undefined){
                // We have a user token, lets try to refresh it.
                this._application.log('authenticationV2', '[checkAuthentication()] Tokens are expired but we have a user token. Lets try to refresh the tokens.')
                this.startSilentFlow()

                return true

            } else {
                this._application.log('authenticationV2', '[checkAuthentication()] No tokens are present.')
                return false
            }
        }
    }

    startSilentFlow(){
        this._application.log('authenticationV2', '[startSilentFlow()] Starting silent flow...')
        this._isAuthenticating = true

        // Force region spoofing if set
        const forceRegionIp = this._application._store.get('force_region_ip', '')
        if (forceRegionIp && typeof forceRegionIp === 'string' && forceRegionIp.trim() !== '') {
            this._xal.setDefaultHeaders({ 'X-Forwarded-For': forceRegionIp.trim() })
            this._application.log('authenticationV2', '[startSilentFlow()] Using X-Forwarded-For:', forceRegionIp)
        } else {
            this._xal.setDefaultHeaders({})
        }

        this._xal.refreshTokens().then(() => {
            this._application.log('authenticationV2', '[startSilentFlow()] Tokens have been refreshed')

            this.getStreamingToken().then((streamingTokens) => {
                if(streamingTokens.xCloudToken !== null){
                    this._application.log('authenticationV2', '[startSilentFlow()] Retrieved both xHome and xCloud tokens')
                    this._appLevel = 2
                } else {
                    this._application.log('authenticationV2', '[startSilentFlow()] Retrieved xHome token only')
                    this._appLevel = 1
                }

                this._xal.getWebToken().then((webToken) => {
                    this._application.log('authenticationV2', __filename+'[startSilentFlow()] Web token received')

                    this._application.authenticationCompleted(streamingTokens, webToken)

                }).catch((error) => {
                    this._application.log('authenticationV2', __filename+'[startSilentFlow()] Failed to retrieve web tokens:', error)
                    dialog.showMessageBox({
                        message: this.t('errors.failedToRetrieveWebTokens') + ' ' + JSON.stringify(error),
                        type: 'error',
                    })
                })

            }).catch((err) => {
                this._application.log('authenticationV2', '[startSilentFlow()] Failed to retrieve streaming tokens:', err)
                dialog.showMessageBox({
                    message: this.t('errors.failedToRetrieveStreamingTokens') + ' ' + JSON.stringify(err),
                    type: 'error',
                })
            })

        }).catch((err) => {
            this._application.log('authenticationV2', '[startSilentFlow()] Error refreshing tokens:', err)
            this._tokenStore.clear()

            this._isAuthenticating = false
            this._isAuthenticated = false
            this._appLevel = 0
        })
    }

    startAuthflow(){
        this._application.log('authenticationV2', '[startAuthflow()] Starting authentication flow')

        this._xal.getRedirectUri().then((redirect) => {
            this.openAuthWindow(redirect.sisuAuth.MsaOauthRedirect)

            this._authCallback = (redirectUri) => {
                this._application.log('authenticationV2', '[startAuthFlow()] Got redirect URI:', redirectUri)
                this._xal.authenticateUser(redirect, redirectUri).then((result) => {
                    this._application.log('authenticationV2', '[startAuthFlow()] Authenticated user:', result)

                    this.startSilentFlow()

                }).catch((err) => {
                    this._application.log('authenticationV2', '[startAuthFlow()] Error authenticating user:', err)
                    dialog.showErrorBox('Error', this.t('errors.errorAuthentificationUser') + ' ' + JSON.stringify(err))
                })
            }
        }).catch((err) => {
            this._application.log('authenticationV2', '[startAuthFlow()] Error getting redirect URI:', err)
            dialog.showErrorBox('Error', this.t('errors.errorGettingRedirectURI') + ' ' + JSON.stringify(err))
        })
    }

    startWebviewHooks(){
        this._application.log('authenticationV2', '[startWebviewHooks()] Starting webview hooks')

        session.defaultSession.webRequest.onHeadersReceived({
            urls: [
                'https://login.live.com/oauth20_authorize.srf?*',
                'https://login.live.com/ppsecure/post.srf?*',
            ],
        }, (details, callback) => {

            if(details.responseHeaders.Location !== undefined && details.responseHeaders.Location[0].includes(this._xal._app.RedirectUri)){
                this._application.log('authenticationV2', '[startWebviewHooks()] Got redirect URI from OAUTH:', details.responseHeaders.Location[0])
                this._authWindow.close()

                if(this._authCallback !== undefined){
                    this._authCallback(details.responseHeaders.Location[0])
                } else {
                    this._application.log('authenticationV2', '[startWebviewHooks()] Authentication Callback is not defined:', this._authCallback)
                    dialog.showErrorBox('Error', this.t('errors.authentificationCallbackIsNotDefined') + ' ' + JSON.stringify(this._authCallback))
                }

                callback({ cancel: true })
            } else {
                callback(details)
            }
        })
    }

    openAuthWindow(url){
        const authWindow = createWindow('auth', {
            width: 500,
            height: 600,
            title: this.t('auth.windowTitle'),
        })

        authWindow.loadURL(url)
        this._authWindow = authWindow

        this._authWindow.on('close', () => {
            this._application.log('authenticationV2', '[openAuthWindow()] Closed auth window')
            // @TODO: What to do?
        })
    }

    async getStreamingToken(){
        const sisuToken = this._tokenStore.getSisuToken()
        if(sisuToken === undefined)
            throw new Error( this.t('errors.sisuTokenIsMissing') )

        const xstsToken = await this._xal.doXstsAuthorization(sisuToken, 'http://gssv.xboxlive.com/')

        if(this._xal._xhomeToken === undefined || this._xal._xhomeToken.getSecondsValid() <= 60){
            this._xal._xhomeToken = await this._xal.getStreamToken(xstsToken, 'xhome')
        }

        if(this._xal._xcloudToken === undefined || this._xal._xcloudToken.getSecondsValid() <= 60){
            try {
                this._xal._xcloudToken = await this._xal.getStreamToken(xstsToken, 'xgpuweb')
            } catch(error){
                try {
                    this._xal._xcloudToken = await this._xal.getStreamToken(xstsToken, 'xgpuwebf2p')
                } catch(error){
                    this._xal._xcloudToken = null
                }
            }
        }

        return { xHomeToken: this._xal._xhomeToken, xCloudToken: this._xal._xcloudToken }
    }


}
