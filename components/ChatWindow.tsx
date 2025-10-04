import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import MessageComponent from './Message';
import { BotIcon } from './icons';

interface ChatWindowProps {
    messages: Message[];
    isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    return (
        <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
            {messages.map((msg, index) => (
                <MessageComponent key={index} message={msg} />
            ))}
            {isLoading && (
                 <div className="flex items-start gap-3 my-4">
                    <BotIcon />
                    <div className="bg-white text-gray-800 p-3 rounded-2xl rounded-bl-none shadow flex items-center space-x-2">
                         <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                         <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-150"></div>
                         <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-300"></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatWindow;
