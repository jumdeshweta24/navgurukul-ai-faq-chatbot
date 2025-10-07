import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const initializeChat = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{googleSearch: {}}],
    },
  });
};

export const sendMessageToAI = async (chat: Chat, message: string): Promise<GenerateContentResponse> => {
  try {
    const response = await chat.sendMessage({ message });
    return response;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw new Error("Failed to get a response from the AI. Please check your API key and network connection.");
  }
};

export const sendMessageToAIStream = async (chat: Chat, message: string) => {
    try {
        const responseStream = await chat.sendMessageStream({ message });
        return responseStream;
    } catch (error) {
        console.error("Error sending message to Gemini:", error);
        throw new Error("Failed to get a streaming response from the AI.");
    }
}
