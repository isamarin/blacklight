import { StreamPlayer, xCloudStreamConfig, StreamPlayerHandle, xStreamToken } from '@greenlight/player/client';
import { Gamepad } from '@greenlight/player/client';
import '@greenlight/player/client.css';
// import type { xCloudStreamConfig } from '@greenlight/player/server';

import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "../utils/trpc";
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef } from 'react';

export function PlayerPage() {
    const trpc = useTRPC();
    const { authState, getWebToken, getxCloudToken, getxHomeToken } = useAuth();

    const consoles = useQuery(trpc.smartglass_consoles_list.queryOptions(getWebToken()));
    const [streamConfig, setStreamConfig] = useState<xCloudStreamConfig | undefined>(undefined);
    const [session, setSession] = useState<{ sessionId: string; sessionPath: string; state: string } | undefined>(undefined);

    const startStreamMutation = useMutation(trpc.streaming_start_stream.mutationOptions());
    const streamGetStatus = useMutation(trpc.streaming_get_status.mutationOptions());
    const streamSendSDPOffer = useMutation(trpc.streaming_send_sdp_offer.mutationOptions());
    const streamSendICECandidates = useMutation(trpc.streaming_send_ice_candidates.mutationOptions());

    const streamPlayerRef = useRef<StreamPlayerHandle>(null);

    const requestStream = async (id: string) => {
        console.log('Requesting stream player setup for console:', id);
        
        const config: xCloudStreamConfig = {
            id: id,
            type: 'home',
            language: 'en-US',
            host: 'https://uks.core.gssv-play-prodxhome.xboxlive.com',
            resolution: 1080
        };

        const streamSession = await startStreamMutation.mutateAsync({
            token: getxHomeToken(),
            xCloudStreamConfig: config
        });
        console.log('Stream session started:', streamSession);

        setStreamConfig(config);
        setSession(streamSession);
    }

    const statusChanged = (newStatus: string) => {
        console.log('Stream player status changed:', newStatus);
    }

    class communicationHandler {

        _token:xStreamToken
        _sessionId:string
        _sessionPath:string
        _streamConfig:xCloudStreamConfig

        constructor(token: xStreamToken, streamConfig:xCloudStreamConfig, session:{ sessionId: string; sessionPath: string; state: string }) {
            this._token = token
            this._sessionId = session.sessionId
            this._sessionPath = session.sessionPath
            this._streamConfig = streamConfig
        }

        getSessionId() {
            return this._sessionId
        }

        getSessionPath() {
            return this._sessionPath
        }

        getStreamConfig() {
            return this._streamConfig
        }

        async getStreamStatus() {
            return await streamGetStatus.mutateAsync({
                token: this._token,
                xCloudStreamConfig: this._streamConfig,
                sessionPath: this._sessionPath
            });
        }

        async sendSDPOffer(sdpOffer:RTCSessionDescriptionInit) {
            return await streamSendSDPOffer.mutateAsync({
                token: this._token,
                xCloudStreamConfig: this._streamConfig,
                sessionPath: this._sessionPath,
                sdpOffer: sdpOffer
            });
        }

        async sendICECandidates(candidates:Array<any>) {
            return await streamSendICECandidates.mutateAsync({
                token: this._token,
                xCloudStreamConfig: this._streamConfig,
                sessionPath: this._sessionPath,
                candidates: candidates
            });
        }
    }

    return (
        <>
            <div className="card">
                <h2>Consoles</h2>

                { consoles.isLoading ? (
                    <p>Loading...</p>
                ) : consoles.isError ? (
                    <p>Error: {consoles.error.message}</p>
                ) : (
                    <div className="tokens-section">
                        { consoles.data && consoles.data.data.result.length > 0 ? (
                            <ul>
                                { consoles.data.data.result.map((console) => (
                                    <li key={console.id}>
                                        <button className="inline" onClick={ () => requestStream(console.id) }>Connect</button>
                                        <strong>{console.name}</strong> (ID: {console.id}, Type: {console.consoleType})
                                    </li>
                                )) }
                            </ul>
                        ) : (
                            <p>No consoles found.</p>
                        ) }
                    </div>
                ) }
            </div>

            { streamConfig && session && <div id="player-container" className="card">
                <h2>Stream Player</h2>
                <StreamPlayer
                    ref={ streamPlayerRef }
                    onStatusChanged={ statusChanged }
                    communicationHandler={ new communicationHandler(getxHomeToken(), streamConfig, session) } />

                {/* <button onClick={ () => {
                    if(streamPlayerRef.current){
                        streamPlayerRef.current.ping('Hello from PlayerPage!');
                    }
                    console.log('Pinged StreamPlayer');
                }}>Ping StreamPlayer</button> */}

                <button onClick={ () => {
                    if(streamPlayerRef.current){
                        streamPlayerRef.current.attachGamepad(0);
                    }
                }}>Attach Gamepad (0)</button>
                <button onClick={ () => {
                    if(streamPlayerRef.current){
                        streamPlayerRef.current.attachMouseKeyboard(0);
                    }
                }}>Attach MouseKeyboard (0)</button>
                <button onClick={ () => {
                    if(streamPlayerRef.current){
                        streamPlayerRef.current.toggleDebugOverlay();
                    }
                }}>Toggle Debug Overlay</button>
            </div>}
        </>
    );
}