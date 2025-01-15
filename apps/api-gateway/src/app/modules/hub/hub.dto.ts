export class HubMessage {
  type: HubMessageType;

  providerInfoReq?: null; // req without body
  providerInfoRes?: ProviderInfo; // req without body

  ollamaChatReq?: OllamaChatReq;
  ollamaChatRes?: OllamaChatRes;
}

export enum HubMessageType {
  ProviderInfoReq,
  ProviderInfoRes,

  ChatReq,
  ChatRes,

  ChatStreamReq,
  ChatStreamRes,
}

export class ProviderInfo {
  providerType: ProviderType;
  providerId: string;
  ollamaProviderDetail?: OllamaProviderDetail;
  chatgptProviderDetail?: OllamaProviderDetail;
}

export enum ProviderType {
  Ollama,
  ChatGPT,
}

export class OllamaProviderDetail {
  models: string[];
}

export class ChatgptProviderDetail {
  models: string[];
}

export class OllamaChatReq {
  model: string;
  messages: Message[];
}

export class OllamaChatRes {
  model: string;
  created_at: Date;
  message: Message;
  done: boolean;
  done_reason: string;
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

export class Message {
  role: string;
  content: string;
  images?: Uint8Array[] | string[];
}

export class Provider {
  id: string;
  model: string;
}
