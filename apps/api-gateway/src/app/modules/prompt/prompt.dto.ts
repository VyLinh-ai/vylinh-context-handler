export class NewChatDto {
  user_id: string;
  model: string;
}

export class NewChatResDto {
  chat_id: string;
  model: string;
}

export class CreatePromptDto {
  user_id: string;
  chat_id?: string;
  model: string;
  prompt: string;
}

export class ChatContent {
  role: string;
  content: string;
}

export class ChatInfo {
  chatId: string;
  chatTitle?: string;
  model: string;
}

export class UserChat {
  user_id: string;
  chat_id: string;
  chat_title?: string;
}

export enum ModelType {
  ChatGPT4o = 'ChatGPT-4o',
  Qwen2_05b = 'qwen2:0.5b',
}