import { Module } from '@nestjs/common';
import { HubService } from './hub.service';
import { AppConfigService } from '../app-config/app-config.service';
import { ProviderModule } from '../provider/provider.module';

@Module({
  providers: [AppConfigService, HubService],
  imports: [ProviderModule],
})
export class HubModule {}
