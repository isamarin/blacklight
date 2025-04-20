import { WebSocketServer } from 'ws'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import appRouter from '@greenlight/platform/dist/trpc.js'

export default class GreenlightServer {

    port: number
    _server: WebSocketServer

    constructor(port = 5050){
        this.port = port;
        this._server = new WebSocketServer({ port: this.port });
        
        this._server.on('connection', (_server) => {
            _server.on('error', console.error)
          
            _server.on('message', (data) => {
                console.log('Received message: %s', data)
            });

            // _server.on('close', () => { });
            // _server.send('something');
        });
    }
    
    start() {
        applyWSSHandler({
            wss: this._server,
            router: appRouter,
            createContext: () => ({}),
        });
        
        console.log('GreenlightServer running on ws://localhost:5050');
    }
}