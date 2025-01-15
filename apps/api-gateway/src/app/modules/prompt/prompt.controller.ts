import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PromptService } from './prompt.service';
import {
  ChatInfo,
  CreatePromptDto,
  NewChatDto,
  NewChatResDto,
} from './prompt.dto';
import { Message } from 'ollama';
import { JwtAuthGuard } from '../auth/guards/api-key.guard';
import { User } from '@prisma/client';
import { CurrentUser } from '../../commons/guards/current-user.decorator';

@Controller('prompt')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Post('newChat')
  @UseGuards(JwtAuthGuard)
  async newChat(
    @Body() body: NewChatDto,
    @CurrentUser() user: User,
  ): Promise<NewChatResDto> {
    const { model } = body;
    return this.promptService.newChat(user.id, model);
  }

  @Post('ask')
  @UseGuards(JwtAuthGuard)
  async ask(@Body() body: CreatePromptDto, @CurrentUser() user: User) {
    let { chat_id } = body;
    const { model, prompt } = body;

    // this.promptService.checkBalance()

    if (!chat_id) {
      const newChat = await this.promptService.newChat(user.id, model);
      chat_id = newChat.chat_id;
    }

    const result = await this.promptService.processPrompt(
      user.id,
      chat_id,
      model,
      prompt,
    );

    return result;
  }

  @Get('chat-history')
  @UseGuards(JwtAuthGuard)
  getUserChatHistory(@CurrentUser() user: User): ChatInfo[] {
    const userId = user.id;
    console.log(userId);
    return this.promptService.getUserChatHistory(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('chat/:chatId')
  getChatDetail(
    @Param('chatId') chatId: string,
    @CurrentUser() user: User,
  ): Message[] {
    return this.promptService.getChatDetail(chatId);
  }
}
