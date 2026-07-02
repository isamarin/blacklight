import { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback } from 'react';
import type { ReactElement } from 'react';
import './Player.css';

import type { xStreamToken, xCloudStreamConfig, startStreamResponse } from '../types/index';
export type { xStreamToken, startStreamResponse, xCloudStreamConfig };

import xCloudPlayer from './lib/player';
import type { VideoRendererMode } from './lib/render/types';

export type { VideoRendererMode };

// Proxy inputs
import Gamepad from './lib/input/gamepad';
import MouseKeyboard from './lib/input/mousekeyboard';
import Touch from './lib/input/touch';

// export { Gamepad, MouseKeyboard, Touch };

export interface StreamPlayerProps {
    onStatusChanged: (newStatus: string) => void;
    onQueueChanged?: (seconds: number) => void;
    communicationHandler: communicationHandler
    videoRenderer?: VideoRendererMode
}
export interface StreamPlayerHandle {
    ping: (echo: string) => void;
    attachGamepad: (index?: number) => VirtualGamepad;
    attachMouseKeyboard: (index?: number) => VirtualMKB;
    toggleDebugOverlay: () => void;
    pressMenu: () => void;
    toggleMic: () => boolean;
    isMicEnabled: () => boolean;
}

export interface communicationHandler {
    getSessionId: () => string;
    getStreamStatus: () => Promise<any>;
    getWaitingTimes?: (targetId: string) => Promise<{ estimatedTotalWaitTimeInSeconds?: number }>;
    getSessionPath: () => string;
    getStreamConfig: () => xCloudStreamConfig;
    sendSDPOffer: (sdpOffer:RTCSessionDescriptionInit) => Promise<any>;
    sendChatSDPOffer: (sdpOffer:RTCSessionDescriptionInit) => Promise<any>;
    sendICECandidates: (candidates:Array<any>) => Promise<any>;
    sendMSALToken: () => Promise<any>;
    sendKeepalive: () => Promise<any>;
}

export const StreamPlayer = forwardRef<StreamPlayerHandle, StreamPlayerProps>(
    ({
        onStatusChanged,
        onQueueChanged,
        communicationHandler,
        videoRenderer = 'auto',
    }, ref): ReactElement => {
        const [playerState, setPlayerState] = useState<string>('Initializing');

        const playerInstance = useRef<HTMLDivElement | null>(null);
        const queueTimesFetched = useRef(false);
        const attachedGamepad = useRef<VirtualGamepad | undefined>(undefined);
        const [player, setPlayer] = useState<xCloudPlayer | undefined>(undefined);

        const ensureGamepad = useCallback(() => {
            if (!player) {
                throw new Error('Player is not initialized yet');
            }
            if (!attachedGamepad.current) {
                const gamepad = new VirtualGamepad(player);
                gamepad.attach(0);
                attachedGamepad.current = gamepad;
            }
            return attachedGamepad.current;
        }, [player]);

        useImperativeHandle(ref, () => ({
            ping(echo: string) {
                // Call into the actual player SDK here
                console.log('Pinging player', echo, playerInstance.current);
            },
            attachGamepad(index = 0) {
                if(!player){
                    throw new Error('Player is not initialized yet');
                }
                const gamepad = new VirtualGamepad(player)
                gamepad.attach(index)
                attachedGamepad.current = gamepad
                return gamepad
            },
            attachMouseKeyboard(index = 0) {
                if(!player){
                    throw new Error('Player is not initialized yet');
                }
                const mkb = new VirtualMKB(player)
                mkb.attach(index)
                return mkb
            },
            toggleDebugOverlay() {
                if(!player){
                    throw new Error('Player is not initialized yet');
                }
                player.toggleDebugOverlay()
            },
            pressMenu() {
                ensureGamepad().sendGamepadButtonPress('Nexus')
            },
            toggleMic() {
                if(!player){
                    throw new Error('Player is not initialized yet');
                }
                const chat = player.getChatChannel()
                if (chat.isPaused) {
                    chat.startMic()
                    return true
                }
                chat.stopMic()
                return false
            },
            isMicEnabled() {
                if(!player){
                    return false
                }
                return !player.getChatChannel().isPaused
            }
        }));

        useEffect(() => {
            onStatusChanged(playerState);
        }, [playerState, onStatusChanged]);

        useEffect(() => {
            let interval: NodeJS.Timeout;

            if(playerState == 'Initializing'){
                interval = setInterval(() => {
                    console.log('Player useEffect - playerState:', playerState);
                    communicationHandler.getStreamStatus().then((state:any) => {
                        console.log('Stream status:', state);

                        if(state.error){
                            console.error('Error in stream status:', state.error);

                            clearInterval(interval)
                            const detail = typeof state.error === 'string'
                                ? state.error
                                : state.error?.message || JSON.stringify(state.error);
                            setPlayerState(`Error: ${detail}`);
                        } else {
                            if(state.state === 'Provisioned'){
                                // Console is ready

                                clearInterval(interval)
                                setPlayerState('Provisioned')

                            } else if(state.state === 'ReadyToConnect'){
                                // Perform MSAL Auth, then refetch state and wait for Provisioned
                                communicationHandler.sendMSALToken()

                            } else if(state.state === 'WaitingForResources'){
                                if (
                                    !queueTimesFetched.current &&
                                    communicationHandler.getWaitingTimes
                                ) {
                                    queueTimesFetched.current = true;
                                    const targetId = communicationHandler.getStreamConfig().id;
                                    communicationHandler.getWaitingTimes(targetId)
                                        .then((waitingTimes) => {
                                            const seconds = waitingTimes?.estimatedTotalWaitTimeInSeconds ?? 0;
                                            if (seconds > 0) {
                                                onQueueChanged?.(seconds);
                                            }
                                        })
                                        .catch((error) => {
                                            console.error('Failed to fetch waiting times:', error);
                                        });
                                }
                                setPlayerState('Waiting in queue...');

                            } else if(state.state === 'Failed'){
                                clearInterval(interval)
                                setPlayerState('Error: Stream session failed');
                            }
                        }

                    })

                }, 1000)
            }

            if(playerState === 'Provisioned'){
                console.log('Xbox is ready to connect... Lets render xCloudPlayer lib...')
                setPlayer(new xCloudPlayer('playerContainer', { videoRenderer }))
            }

            return () => {
                console.log('Cleaning up player useEffect interval');
                clearInterval(interval)
            }
        }, [playerState]);

        useEffect(() => {
            let keepaliveInterval : NodeJS.Timeout;
            if(player){
                player.init();

                player.setChatSdpHandler(async (offer) => {
                    try {
                        const serverOffer = await communicationHandler.sendChatSDPOffer(offer)
                        const remoteSDP = JSON.parse(serverOffer.exchangeResponse)
                        await player.setRemoteSDP(remoteSDP.sdp)
                    } catch (error) {
                        console.error('Chat SDP exchange error:', error)
                        player.getChatChannel().stopMic()
                    }
                })

                player.createOffer().then(async (offer) => {
                    console.log('Created offer:', offer);
                    const serverOffer = await communicationHandler.sendSDPOffer(offer)
                    const remoteSDP = JSON.parse(serverOffer.exchangeResponse);

                    console.log('Received SDP Offer:', serverOffer);

                    player.setRemoteSDP(remoteSDP.sdp);

                    // Start ICE handshake
                    const localIce = await player.getICECandidates()
                    console.log('Retrieved local ICE:', localIce);
                    const iceCandidates = localIce.map((candidate) => {
                        return JSON.stringify({ candidate: candidate.candidate, sdpMid: candidate.sdpMid, sdpMLineIndex: candidate.sdpMLineIndex, usernameFragment: candidate.usernameFragment })
                    })

                    const remoteIce = await communicationHandler.sendICECandidates(iceCandidates)
                    console.log('Received ICE Candidates:', remoteIce);
                    const serverIce = JSON.parse(remoteIce.exchangeResponse);
                    console.log('Received ICE Candidates 2:', serverIce);
                    player.setRemoteIceCandidates(serverIce)

                    keepaliveInterval = setInterval(async () => {
                        console.log('Sending keepalive...');
                        await communicationHandler.sendKeepalive()
                    }, 30 * 1000);
                })
            }

            return () => {
                if(player){
                    player.destroy();
                    clearInterval(keepaliveInterval)
                }
            }
        }, [player]);

        return (
            <div ref={playerInstance} className="stream-player-host">
                <div id="playerContainer" />
            </div>
        );
    }
);

// CONTROLS

class VirtualGamepad {

    _isAttached = false
    _gamepad:Gamepad | undefined
    _player:xCloudPlayer

    constructor(player:xCloudPlayer) {
        this._player = player
    }

    attach(index = 0) {
        console.log('[VirtualGamepad] Attaching virtual gamepad on index:', index)
        this._gamepad = new Gamepad(index, { 
            enable_keyboard: true,
        })

        if(this._player){
            this._gamepad.attach(this._player)
            this._isAttached = true
        } else {
            console.log('[VirtualGamepad] Failed to attach gamepad to Player istance:', this._player)
            return
        }
    }

    detach() {
        if(this._isAttached === false){
            console.log('[VirtualGamepad] Virtual Gamepad is not attached')
            return
        }
        this._gamepad?.detach()
        this._isAttached = false
    }

    sendGamepadButtonPress(button: string) {
        this._gamepad?.sendButtonState(button, 1)
        setTimeout(() => {
            this._gamepad?.sendButtonState(button, 0)
        }, 50)
    }

    sendGamepadButtonState(button: string, value: number) {
        this._gamepad?.sendButtonState(button, value)
    }
}

class VirtualMKB {
    _isAttached = false
    _mkb: MouseKeyboard | undefined
    _player:xCloudPlayer

    constructor(player:xCloudPlayer) {
        this._player = player
    }

    attach(index = 0) {
        console.log('[VirtualMKB] Attaching MKB on index:', index)
        this._mkb = new MouseKeyboard(index)

        if(this._player){
            this._mkb.attach(this._player)
            this._isAttached = true
        } else {
            console.log('[VirtualMKB] Failed to attach MKB to Player istance:', this._player)
            return
        }
    }

    detach() {
        if(this._isAttached === false){
            console.log('[VirtualMKB] Virtual MKB is not attached')
            return
        }
        this._mkb?.detach()
        this._isAttached = false
    }
}