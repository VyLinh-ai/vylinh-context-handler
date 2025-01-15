import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  readonly port: number;
  readonly redis_host: string;
  readonly redis_port: number;
  readonly hub: HubConfig;

  constructor(configService: ConfigService) {
    this.port = configService.get<number>('app.port');
    this.redis_host = configService.get<string>('app.redis_host');
    this.redis_port = configService.get<number>('app.redis_port');
    this.hub = new HubConfig(configService);
  }
}

export class HubConfig {
  privkey_path: string;
  pubkey_path: string;
  cert_path: string;
  rootca_cert_path: string;
  host: string;
  port: number;

  constructor(configService: ConfigService) {
    this.privkey_path = configService.get<string>('app.hub.privkey_path');
    this.pubkey_path = configService.get<string>('app.hub.pubkey_path');
    this.cert_path = configService.get<string>('app.hub.cert_path');
    this.rootca_cert_path = configService.get<string>(
      'app.hub.rootca_cert_path',
    );
    this.host = configService.get<string>('app.hub.host');
    this.port = configService.get<number>('app.hub.port');
  }
}
