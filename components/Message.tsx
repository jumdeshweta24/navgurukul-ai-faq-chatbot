import React from 'react';
import { Message, MessageRole } from '../types';
import { UserIcon, BotIcon } from './icons';

interface MessageProps {
    message: Message;
}

const MessageComponent: React.FC<MessageProps> = ({ message }) => {
    const isUser = message.role === MessageRole.USER;
    const isSystem = message.role === MessageRole.SYSTEM;

    if (isSystem) {
        return (
            <div className="text-center my-2">
                <p className="text-xs text-gray-500 bg-gray-200 rounded-full px-3 py-1 inline-block">{message.text}</p>
            </div>
        )
    }

    return (
        <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && <BotIcon />}
            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-md md:max-w-lg lg:max-w-2xl p-3 rounded-2xl shadow ${isUser ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                    {message.fileInfo && (
                        <div className="mb-2 p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 text-sm">
                            <p className="font-bold">File: {message.fileInfo.name}</p>
                            <p className="text-xs">{message.fileInfo.type}</p>
                        </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
            </div>
            {isUser && <UserIcon />}
        </div>
    );
};

export default MessageComponent;
