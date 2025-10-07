import React, { useState, useRef, useEffect, forwardRef } from 'react';
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

const InputBar = forwardRef<HTMLTextAreaElement, InputBarProps>(({ onSendMessage, isLoading }, ref) => {
    const [text, setText] = useState('');
    const [micStatus, setMicStatus] = useState<'idle' | 'listening' | 'error' | 'denied'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API is not supported in this browser.");
            setMicStatus('denied');
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onstart = () => {
            setMicStatus('listening');
        };

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setText(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setMicStatus('denied');
            } else {
                setMicStatus('error');
                setTimeout(() => setMicStatus(prev => prev === 'error' ? 'idle' : prev), 2000);
            }
        };
        
        recognitionRef.current.onend = () => {
            setMicStatus(prev => (prev === 'denied' ? 'denied' : 'idle'));
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);


    const handleSend = () => {
        if (text.trim() && !isLoading) {
            onSendMessage(text.trim());
            setText('');
        }
    };

    const handleMicClick = () => {
        if (!recognitionRef.current || isLoading || micStatus === 'denied') return;

        if (micStatus === 'listening') {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
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
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getMicTooltip = () => {
        switch (micStatus) {
            case 'listening':
                return 'Stop listening';
            case 'denied':
                return 'Microphone access is denied or not supported';
            case 'error':
                return 'Recognition error, please try again';
            default:
                return 'Use microphone';
        }
    };

    return (
        <div className="bg-white p-4 border-t border-gray-200">
            <div className="flex items-center bg-gray-100 rounded-full p-2" role="toolbar" aria-label="Message input toolbar">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="p-2 text-gray-500 hover:text-orange-600 disabled:opacity-50 transition-colors"
                    aria-label="Attach file"
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
                    ref={ref}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="Ask a question about NavGurukul..."
                    className="flex-1 bg-transparent px-4 py-2 resize-none outline-none text-gray-800 placeholder-gray-500"
                    rows={1}
                    disabled={isLoading}
                    aria-label="Ask a question about NavGurukul"
                />
                <button
                    onClick={handleMicClick}
                    disabled={isLoading || micStatus === 'denied'}
                    className="p-2 hover:bg-gray-200 rounded-full disabled:opacity-50 transition-colors"
                    aria-label={getMicTooltip()}
                    aria-pressed={micStatus === 'listening'}
                    title={getMicTooltip()}
                >
                    <MicIcon status={micStatus} />
                </button>
                <button
                    onClick={handleSend}
                    disabled={isLoading || !text.trim()}
                    className="p-3 ml-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed transition-all"
                    aria-label="Send message"
                >
                    <SendIcon />
                </button>
            </div>
        </div>
    );
});

export default InputBar;