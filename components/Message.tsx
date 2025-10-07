import React, { useState } from 'react';
import { Message, MessageRole } from '../types';
import { UserIcon, BotIcon, ThumbsUpIcon, ThumbsDownIcon, CopyIcon, CheckIcon, SearchIcon } from './icons';

interface MessageProps {
    message: Message;
    onFeedback?: (messageId: string, feedback: 'up' | 'down') => void;
}

const MessageComponent: React.FC<MessageProps> = ({ message, onFeedback }) => {
    const [isCopied, setIsCopied] = useState(false);
    const isUser = message.role === MessageRole.USER;
    const isModel = message.role === MessageRole.MODEL;
    const isSystem = message.role === MessageRole.SYSTEM;

    const isGenericBotMessage = isModel && (
        message.text.startsWith("Hello!") ||
        message.text.startsWith("Chat cleared.")
    );

    const formatText = (text: string) => {
        // A simple markdown to HTML converter for bold and italics
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.text);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Revert icon after 2 seconds
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    if (isSystem) {
        return (
            <div className="text-center my-2">
                <p className="text-xs text-gray-500 bg-gray-200 rounded-full px-3 py-1 inline-block">{message.text}</p>
            </div>
        )
    }
    
    const bubbleClasses = isUser
        ? 'bg-orange-500 text-white rounded-br-none'
        : 'bg-white text-gray-800 border border-gray-200/80 rounded-bl-none';

    const messageBody = (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-md md:max-w-lg lg:max-w-2xl p-3.5 rounded-2xl shadow-sm ${bubbleClasses}`}>
                {message.fileInfo && (
                    <div className="mb-2 p-2 border border-gray-300/50 rounded-lg bg-white/30 text-current text-sm">
                        <p className="font-bold">File: {message.fileInfo.name}</p>
                        <p className="text-xs opacity-80">{message.fileInfo.type}</p>
                    </div>
                )}
                <div className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(message.text) }} />
            </div>
            
            {isModel && !isGenericBotMessage && (
                <div className="mt-3 flex items-center gap-3">
                    {onFeedback && (
                        <>
                            {!message.feedback ? (
                                <p className="text-xs text-gray-600">Was this helpful?</p>
                            ) : (
                                <p className="text-xs text-gray-500">Thanks for your feedback!</p>
                            )}
                            <button
                                onClick={() => onFeedback(message.id, 'up')}
                                disabled={!!message.feedback}
                                className={`p-1.5 rounded-full transition-colors ${
                                    message.feedback === 'up'
                                        ? 'bg-green-100 text-green-700'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-green-600 disabled:text-gray-400 disabled:bg-transparent disabled:cursor-not-allowed'
                                }`}
                                aria-label="Good response"
                                aria-pressed={message.feedback === 'up'}
                            >
                                <ThumbsUpIcon />
                            </button>
                            <button
                                onClick={() => onFeedback(message.id, 'down')}
                                disabled={!!message.feedback}
                                className={`p-1.5 rounded-full transition-colors ${
                                    message.feedback === 'down'
                                        ? 'bg-red-100 text-red-700'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-red-600 disabled:text-gray-400 disabled:bg-transparent disabled:cursor-not-allowed'
                                }`}
                                aria-label="Bad response"
                                aria-pressed={message.feedback === 'down'}
                            >
                                <ThumbsDownIcon />
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleCopy}
                        className={`p-1.5 rounded-full transition-colors ${
                            isCopied
                                ? 'bg-green-100 text-green-700'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                        aria-label={isCopied ? "Copied!" : "Copy response"}
                        aria-live="polite"
                    >
                        {isCopied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                </div>
            )}

            {!isUser && message.sources && message.sources.length > 0 && (
                 <div className="mt-4 pt-4 border-t border-gray-200/80 w-full max-w-md md:max-w-lg lg:max-w-2xl">
                    <h4 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-2">
                        <SearchIcon />
                        <span>Search Results</span>
                    </h4>
                    <div className="space-y-3">
                        {message.sources.map((source, index) => (
                            <div key={index} className="bg-white p-3 rounded-lg border border-gray-200/80 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300">
                                <a
                                    href={source.web.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-semibold text-orange-600 hover:underline"
                                    title={source.web.title}
                                >
                                    {source.web.title || new URL(source.web.uri).hostname}
                                    <span className="sr-only">(opens in a new tab)</span>
                                </a>
                                <p className="text-xs text-gray-500 mt-0.5 truncate">{source.web.uri}</p>
                                {source.retrievedContext?.text && (
                                     <blockquote className="mt-2 text-xs text-gray-600 leading-relaxed border-l-2 border-orange-200 pl-2 italic">
                                        "{source.retrievedContext.text}"
                                    </blockquote>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
    
    if (isUser) {
        return (
            <div className="flex items-start gap-3 my-4 justify-end">
                {messageBody}
                <UserIcon />
            </div>
        );
    }
    
    return (
        <div className={`flex items-start gap-3 my-4`}>
            <BotIcon />
            {messageBody}
        </div>
    );
};

export default MessageComponent;