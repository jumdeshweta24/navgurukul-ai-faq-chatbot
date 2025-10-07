import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import MessageComponent from './Message';
import { BotIcon } from './icons';

interface ChatWindowProps {
    messages: Message[];
    isLoading: boolean;
    onPromptClick: (prompt: string) => void;
    flashBg: boolean;
}

const suggestedPrompts = [
    "What courses are taught at NavGurukul?",
    "Tell me about the daily schedule.",
    "What is the leave policy?",
    "How does the placement process work?",
];

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onPromptClick, flashBg }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    return (
        <div className={`flex-1 p-6 overflow-y-auto ${flashBg ? 'bg-orange-200' : 'bg-orange-100'} transition-colors duration-300`}>
            {messages.map((msg, index) => (
                <MessageComponent key={index} message={msg} />
            ))}

            {messages.length <= 1 && !isLoading && (
                <div className="my-8">
                    <p className="text-center text-gray-600 font-medium mb-4">Or try one of these example questions:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                        {suggestedPrompts.map((prompt, index) => (
                            <button
                                key={index}
                                onClick={() => onPromptClick(prompt)}
                                className="text-left p-4 bg-white/60 hover:bg-white rounded-lg shadow-sm border border-gray-200/80 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                            >
                                <p className="font-semibold text-gray-800">{prompt}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {isLoading && (
                 <div className="flex items-start gap-3 my-4">
                    <BotIcon />
                    <div className="bg-white text-gray-800 p-3.5 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2 border border-gray-200/80">
                         <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                         <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                         <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatWindow;