import { StreamPlayer, xCloudStreamConfig } from '@greenlight/player/client';
import '@greenlight/player/style.css';
// import type { xCloudStreamConfig } from '@greenlight/player/server';

import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "../utils/trpc";
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export function PlayerPage() {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { authState, getWebToken, getxCloudToken, getxHomeToken } = useAuth();

    const consoles = useQuery(trpc.smartglass_consoles_list.queryOptions(getWebToken()));
    const [streamConfig, setStreamConfig] = useState<xCloudStreamConfig | undefined>(undefined);

    const requestStream = async (id: string) => {
        console.log('Requesting stream player setup for console:', id);
        
        const config: xCloudStreamConfig = {
            id: id,
            type: 'home',
            language: 'en-US',
            host: 'https://uks.core.gssv-play-prodxhome.xboxlive.com',
            resolution: 1080
        };

        const streamSession = await queryClient.fetchQuery(trpc.streaming_start_stream.queryOptions({
            token: getxCloudToken(),
            xCloudStreamConfig: config
        }))
        console.log('Stream session started:', streamSession);

        setStreamConfig(config);
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

            { streamConfig && <div id="player-container" className="card">
                <h2>Stream Player</h2>
                <StreamPlayer xCloudStreamConfig={ streamConfig } />
            </div>}
        </>
    );
}
