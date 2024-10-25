import React from 'react'
import { AiChat, AiChatUI, useAsStreamAdapter } from '@nlux/react';
import { useChatAdapter } from '@nlux/langchain-react';
import '@nlux/themes/nova.css';

export interface NluxProps {

}

const Nlux: React.FC<NluxProps> = (props) => {

    const adapter = useChatAdapter({
        url: 'https://pynlux.api.nlkit.com/pirate-speak'
    });

    const options = {
        personaOptions: {
            assistant: {
                name: 'Feather-AI',
                avatar: 'https://docs.nlkit.com/nlux/images/personas/feather.png',
                tagline: 'Yer AI First Mate!'
            },
            user: {
                name: 'Alex',
                avatar: 'https://docs.nlkit.com/nlux/images/personas/alex.png'
            }
        },
        displayOptions: {
            themeId: 'nova',
            colorScheme: 'dark',
            width: '100%',
            height: 'calc(100vh - 50px)'
        }
    }



    // The adapter is the only required prop
    // Other props available to customize the chat but are optional
    return (
        <AiChat adapter={adapter} {...options} >
            <AiChatUI.Loader>
                <span className="rounded">Loading 👻</span>
            </AiChatUI.Loader>
        </AiChat>
    );
}
export default Nlux