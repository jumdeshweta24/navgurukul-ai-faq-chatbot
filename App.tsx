import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { Message, MessageRole, GroundingChunk } from './types';
import { initializeChat, sendMessageToAIStream } from './services/geminiService';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';

const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: generateUniqueId(), role: MessageRole.MODEL, text: "Hello! I am the NavGurukul AI Assistant. How can I help you today?", feedback: null }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [flashBg, setFlashBg] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const startNewChat = useCallback(() => {
        chatRef.current = initializeChat();
        setMessages([
            { id: generateUniqueId(), role: MessageRole.MODEL, text: "Chat cleared. Ready for your next question!", feedback: null }
        ]);
    }, []);

    useEffect(() => {
        chatRef.current = initializeChat();
    }, []);

    const handleClearHistory = () => {
        startNewChat();
        setFlashBg(true);
        setTimeout(() => setFlashBg(false), 300);
    };

    const handleFeedback = (messageId: string, feedback: 'up' | 'down') => {
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === messageId ? { ...msg, feedback } : msg
            )
        );
    };

    const readFileAsText = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
            // Basic text extraction for demo. PDF/DOCX would need complex libraries.
            if (file.type === "application/pdf" || file.type.includes("wordprocessingml")) {
                resolve(`[File content for ${file.name} cannot be read directly. This is a placeholder for file content extraction.]`);
            } else {
                reader.readAsText(file);
            }
        });
    };

    const handleSendMessage = async (text: string, file?: File) => {
        if (!chatRef.current || isLoading) return;

        const userMessage: Message = { id: generateUniqueId(), role: MessageRole.USER, text };
        let fileContent = "";
        const preApiMessages: Message[] = [];

        if (file) {
            userMessage.fileInfo = { name: file.name, type: file.type };
            try {
                fileContent = await readFileAsText(file);
                preApiMessages.push({
                    id: generateUniqueId(),
                    role: MessageRole.SYSTEM,
                    text: `You have uploaded ${file.name}.`
                });
            } catch (error) {
                console.error("Error reading file:", error);
                const errorMessage: Message = { id: generateUniqueId(), role: MessageRole.MODEL, text: "Sorry, I couldn't read that file.", feedback: null };
                setMessages(prev => [...prev, userMessage, errorMessage]);
                return;
            }
        }

        preApiMessages.push(userMessage);
        setMessages(prev => [...prev, ...preApiMessages]);
        setIsLoading(true);

        const prompt = fileContent
            ? `Based on the content of the file "${file?.name}", answer the following question.\n\nFile Content:\n---\n${fileContent}\n---\n\nQuestion: ${text}`
            : text;

        try {
            const responseStream = await sendMessageToAIStream(chatRef.current, prompt);

            let isFirstChunk = true;
            let currentResponseText = "";
            let sources: GroundingChunk[] = [];
            let responseId = generateUniqueId();

            for await (const chunk of responseStream) {
                currentResponseText += chunk.text;

                const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
                if (groundingMetadata?.groundingChunks) {
                    sources.push(...groundingMetadata.groundingChunks.filter((c: any): c is GroundingChunk => c.web));
                }

                if (isFirstChunk) {
                    setMessages(prev => [...prev, { id: responseId, role: MessageRole.MODEL, text: currentResponseText, sources: [], feedback: null }]);
                    isFirstChunk = false;
                } else {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage?.role === MessageRole.MODEL) {
                            lastMessage.text = currentResponseText;
                        }
                        return newMessages;
                    });
                }
            }

            if (!isFirstChunk && sources.length > 0) {
                const uniqueSources = Array.from(new Map(sources.map(item => [item.web.uri, item])).values());
                 setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage?.role === MessageRole.MODEL) {
                        lastMessage.sources = uniqueSources;
                    }
                    return newMessages;
                });
            }

            if (isFirstChunk) { // Handle cases where the stream is empty
                setMessages(prev => [...prev, {
                    id: generateUniqueId(),
                    role: MessageRole.MODEL,
                    text: "I'm sorry, I couldn't generate a response. Please try rephrasing your question.",
                    feedback: null,
                }]);
            }

        } catch (error) {
            console.error(error);
            const errorMessage: Message = {
                id: generateUniqueId(),
                role: MessageRole.MODEL,
                text: "Oops! Something went wrong. Please try again later.",
                feedback: null,
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };


    return (
        <div className="flex flex-col h-screen font-sans bg-orange-50/50">
            <Header onClearHistory={handleClearHistory} />
            <ChatWindow 
                messages={messages} 
                isLoading={isLoading} 
                onPromptClick={handleSendMessage}
                flashBg={flashBg} 
                onFeedback={handleFeedback}
            />
            <InputBar ref={inputRef} onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
    );
};

export default App;