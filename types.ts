
export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}
