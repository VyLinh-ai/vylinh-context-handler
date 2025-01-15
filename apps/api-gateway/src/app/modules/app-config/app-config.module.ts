import { Module } from '@nestjs/common';
import { AppConfigService } from './app-config.service';

@Module({
  providers: [AppConfigService],
  imports: [],
  exports: [AppConfigService],
})
export class AppConfigModule {}
