import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, MicIcon, PaperclipIcon } from './icons';

interface InputBarProps {
    onSendMessage: (text: string, file?: File) => void;
    isLoading: boolean;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading }) => {
    const [text, setText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setText(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event);
                setIsListening(false);
            };
            
            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const handleSend = () => {
        if (text.trim() && !isLoading) {
            onSendMessage(text.trim());
            setText('');
        }
    };

    const handleMicClick = () => {
        if (!recognitionRef.current || isLoading) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (text.trim()) {
                onSendMessage(text.trim(), file);
            } else {
                onSendMessage(`Analyze this file: ${file.name}`, file);
            }
            setText('');
        }
        // Reset file input to allow selecting the same file again
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-white p-4 border-t border-gray-200">
            <div className="flex items-center bg-gray-100 rounded-lg p-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="p-2 text-gray-500 hover:text-indigo-600 disabled:opacity-50"
                >
                    <PaperclipIcon />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".txt,.pdf,.docx"
                />
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="Ask a question about NavGurukul..."
                    className="flex-1 bg-transparent px-4 py-2 resize-none outline-none text-gray-800"
                    rows={1}
                    disabled={isLoading}
                />
                <button
                    onClick={handleMicClick}
                    disabled={isLoading}
                    className="p-2 hover:bg-gray-200 rounded-full disabled:opacity-50"
                >
                    <MicIcon isListening={isListening} />
                </button>
                <button
                    onClick={handleSend}
                    disabled={isLoading || !text.trim()}
                    className="p-2 ml-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                >
                    <SendIcon />
                </button>
            </div>
        </div>
    );
};

export default InputBar;
