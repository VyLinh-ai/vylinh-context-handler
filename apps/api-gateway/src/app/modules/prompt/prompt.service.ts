import { Injectable } from '@nestjs/common';
import { ChatInfo, NewChatResDto } from './prompt.dto';
import { v4 as uuidv4 } from 'uuid';
import { Message } from 'ollama';
import { ProviderType } from '../hub/hub.dto';
import { ProviderService } from '../provider/provider.service';

const TOKEN_PRICE = 0.00000000000001;

@Injectable()
export class PromptService {
  /// userId -> chatId[]
  private userChats: Map<string, string[]> = new Map();
  /// chatId
  private chatInfos: Map<string, ChatInfo> = new Map();
  /// chatId -> 
  private chatHistories: Map<string, Message[]> = new Map();

  constructor(
    private readonly providerService: ProviderService,
  ) {
  }

  async newChat(user_id: string, model: string): Promise<NewChatResDto> {
    const chatId = uuidv4();

    // Initialize an empty array of chat messages for this chat
    this.userChats.set(user_id,
      this.userChats.get(user_id) === undefined ?
        [] : [...this.userChats.get(user_id), chatId])
    this.chatInfos.set(chatId, { model, chatId });
    this.chatHistories.set(chatId, []);

    const response: NewChatResDto = {
      chat_id: chatId,
      model,
    };
    return response;
  }

  async processPrompt(userId: string, chatId: string, model: string, prompt: string) {
    if (!this.chatInfos.get(chatId)) {
      throw new Error('Unexisting chatId');
    }

    // update model changes
    let chatInfo = this.chatInfos.get(chatId);
    if (model !== chatInfo.model) {
      chatInfo.model = model;
      this.chatInfos.set(chatId, chatInfo);
    }

    // update chat title
    if (!chatInfo.chatTitle) {
      chatInfo.chatTitle = prompt.length <= 25 ? prompt : prompt.slice(0, 24);
      this.chatInfos.set(chatId, chatInfo);
    }

    let chatHistories = this.chatHistories.get(chatId);
    let providers = this.providerService.findProvidersByModel(model);
    if (providers.length == 0) {
      throw new Error('No providers for model found');
    }

    // take the first
    let provider = this.providerService.findProvidersByModel(model)[0];
    let response: string;
    let totalTokenCount = 0;
    switch (provider.providerInfo.providerType) {
      case ProviderType.Ollama:
        const messages: Message[] = [
          ...chatHistories,
          {
            role: 'user',
            content: prompt,
          }
        ]
        const res = await provider.chat(model, messages);
        response = res.ollamaChatRes.message.content
        totalTokenCount = res.ollamaChatRes.prompt_eval_count + res.ollamaChatRes.eval_count;

        // save message to history
        let assistantMsg: Message = {
          role: 'assistant',
          content: response,
        }
        this.chatHistories.set(chatId, [
          ...messages, assistantMsg
        ]);
        break;
      default:
        throw new Error(`platform is not supported yet ${provider.providerInfo.providerType}`)
    }

    return {
      user_id: userId,
      model: model,
      prompt: prompt,
      response: response,
      token_count: totalTokenCount,
      token_price: TOKEN_PRICE,
    };
  }

  getUserChatHistory(userId: string): ChatInfo[] {
    const chatIds = this.userChats.get(userId) || [];
    const chatInfoList: ChatInfo[] = [];

    for (const chatId of chatIds) {
      const chatInfo = this.chatInfos.get(chatId);
      if (chatInfo) {
        chatInfoList.push(chatInfo);
      }
    }

    return chatInfoList;
  }

  getChatDetail(chatId: string): Message[] {
    const chatHistory = this.chatHistories.get(chatId);

    if (!chatHistory) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }

    return chatHistory;
  }
}
