import { useState } from 'react';

import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../utils/trpc";

export function QueryPage({ method, title, sendData, fields }: { method: string; title: string, sendData: any, fields?: Record<string, any> }) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const [result, setResult] = useState<any | null>(null);

    console.log('QueryPage render:', { method, title, sendData });

    const performQuery = () => {
        // Access the tRPC method dynamically
        const trpcMethod = (trpc as any)[method];
        
        if (!trpcMethod) {
            console.error(`Method ${method} not found on tRPC client`);
            return;
        }

        for(const field in sendData){
            const inputElement = document.getElementById(field) as HTMLInputElement;
            if(inputElement){
                const value = inputElement.value.trim();
                
                // Try to parse as JSON (handles arrays and objects)
                if (value.startsWith('[') || value.startsWith('{')) {
                    try {
                        sendData[field] = JSON.parse(value);
                    } catch (e) {
                        // If parsing fails, use as string
                        sendData[field] = value;
                    }
                } else {
                    sendData[field] = value;
                }
            }
        }

        queryClient.fetchQuery(trpcMethod.queryOptions(sendData))
            .then((data) => {
                setResult(data);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setResult(null);
            });
    }

    return (
        <>
            <div className="card">
                <h2>{ title }</h2>

                { fields && Object.entries(fields).map(([key, value]) => (
                    <div key={key}>
                        <label htmlFor={key}>{key}:</label> <input className="filter-input" defaultValue={value} id={key} />
                    </div>
                ))}

                <button onClick={performQuery}>
                    Execute
                </button>
            </div>

            <div className="card">
                <h2>Result</h2>

                <div className="tokens-section">
                    <div>
                        <div className="result-section">
                            <pre>{ result ? JSON.stringify(result, null, 2) : "No action performed yet"}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
