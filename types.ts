export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
  retrievedContext?: {
    text: string;
  };
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  fileInfo?: {
    name: string;
    type: string;
  };
  sources?: GroundingChunk[];
  feedback?: 'up' | 'down' | null;
}