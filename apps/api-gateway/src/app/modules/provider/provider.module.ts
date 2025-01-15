import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { PromptService } from '../prompt/prompt.service';
import { PromptController } from '../prompt/prompt.controller';

@Module({
  providers: [ProviderService, PromptService],
  controllers: [ProviderController, PromptController],
  exports: [ProviderService],
})
export class ProviderModule {}
