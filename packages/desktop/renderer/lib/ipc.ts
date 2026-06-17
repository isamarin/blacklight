import pkg from '../../package.json'
import WebsocketIPC from './websocket'

export default {

    // on(channel:string, listener){
    //     ipcRenderer.on(channel, listener)
    // },

    send(channel:string, action:string, data = {}){
        if(window.Blacklight === undefined){
            // Electron API Not available. Lets mock!
            window.Blacklight = this.websocketFallbackApi()
        }

        // console.log('DEBUG:', window.Blacklight)
        return window.Blacklight.send(channel, action, data)
    },

    on(channel:string, listener){
        if(window.Blacklight === undefined){
            // Electron API Not available. Lets mock!
            window.Blacklight = this.websocketFallbackApi()
        }

        // console.log('DEBUG', window.Blacklight)
        return window.Blacklight.on(channel, listener)
    }, 

    onAction(channel:string, action:string, listener){
        if(window.Blacklight === undefined){
            // Electron API Not available. Lets mock!
            window.Blacklight = this.websocketFallbackApi()
        }

        // console.log('DEBUG', window.Blacklight)
        return window.Blacklight.onAction(channel, action, listener)
    },

    removeListener(channel:string, listener){
        if(window.Blacklight === undefined){
            // Electron API Not available. Lets mock!
            window.Blacklight = this.websocketFallbackApi()
        }

        // console.log('DEBUG', window.Blacklight)
        return window.Blacklight.removeListener(channel, listener)
    },

    websocketFallbackApi(){
        const websocket = new WebsocketIPC('ws://'+window.location.hostname+':'+window.location.port+'/ipc')

        console.log('Injecting Blacklight Websocker IPC')

        return {
            _websocket: websocket,

            send(channel, action, data){
                // console.log('BlacklightAPI send()', channel, action, data)
                return this._websocket.send(channel, action, data)
            },
            on(channel, listener){
                // console.log('BlacklightAPI on()', channel, listener)
                return this._websocket.on(channel, listener)
            },
            onAction(channel, action, listener){
                // console.log('BlacklightAPI onAction()', channel, action, listener)
                return this._websocket.onAction(channel, action, listener)

            },
            removeListener(channel, listener){
                // console.log('BlacklightAPI removeListener()', channel, listener)
                return this._websocket.removeListener(channel, listener)
            },

            getVersion(){
                return pkg.version+' (WebUI)'
            },

            openExternal(url:string){
                window.open(url, '_blank')
            },

            isWebUI(){
                return true
            },
        }
    },
}

