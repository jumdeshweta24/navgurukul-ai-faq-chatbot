export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
}

export interface Message {
  role: MessageRole;
  text: string;
  fileInfo?: {
    name: string;
    type: string;
  };
}
