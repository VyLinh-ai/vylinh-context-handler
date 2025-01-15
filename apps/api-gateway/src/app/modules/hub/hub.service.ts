import {
  events,
  QUICServer,
  QUICSocket,
  ServerCryptoOps,
} from '@matrixai/quic';
import { Injectable, OnModuleInit } from '@nestjs/common';
import Logger, { LogLevel, StreamHandler, formatting } from '@matrixai/logger';
import * as testsUtils from './utils';
import * as fs from 'fs';
import { AppConfigService } from '../app-config/app-config.service';
import { ProviderInstance } from '../provider/provider-instance.dto';
import { ProviderService } from '../provider/provider.service';

@Injectable()
export class HubService implements OnModuleInit {
  private logger = new Logger(HubService.name);
  private quicSocket: QUICSocket;
  private quicServer: QUICServer;
  private quicLogger;

  private connIdToProvider: Map<string, ProviderInstance> = new Map();

  constructor(
    private readonly appConfig: AppConfigService,
    private readonly providerService: ProviderService,
  ) {}

  async onModuleInit() {
    const privateKey = fs.readFileSync(this.appConfig.hub.privkey_path, 'utf8');
    const publicKey = fs.readFileSync(this.appConfig.hub.pubkey_path, 'utf8');
    const certRSAPEM = fs.readFileSync(this.appConfig.hub.cert_path, 'utf8');
    const keyPairRSAPEM = {
      publicKey,
      privateKey,
    };

    const key: ArrayBuffer = await testsUtils.generateKeyHMAC();
    const serverCryptoOps: ServerCryptoOps = {
      sign: testsUtils.signHMAC,
      verify: testsUtils.verifyHMAC,
    };
    const logger = new Logger(`${QUICServer.name}`, LogLevel.INFO, [
      new StreamHandler(
        formatting.format`${formatting.level}:${formatting.keys}:${formatting.msg}`,
      ),
    ]);
    this.quicSocket = new QUICSocket({
      logger: logger.getChild('socket'),
    });
    await this.quicSocket.start({
      host: this.appConfig.hub.host,
      port: this.appConfig.hub.port,
    });
    this.quicServer = new QUICServer({
      logger: logger.getChild(QUICServer.name),
      crypto: {
        key,
        ops: serverCryptoOps,
      },
      config: {
        key: keyPairRSAPEM.privateKey,
        cert: certRSAPEM,
      },
      socket: this.quicSocket,
    });
    this.quicServer.addEventListener(
      events.EventQUICServerConnection.name,
      async (e: events.EventQUICServerConnection) => {
        try {
          await this.handleConnection(e);
        } catch (error) {
          this.logger.error(`handle conn failed: ${error}`);
        }
      },
    );
    await this.quicServer.start({
      host: this.appConfig.hub.host,
      port: this.appConfig.hub.port,
    });
  }

  private async handleConnection(e: events.EventQUICServerConnection) {
    const conn = e.detail;
    const connId = conn.connectionId.toString();

    const providerInst = new ProviderInstance();
    await providerInst.getProviderInfo(conn);

    this.connIdToProvider.set(connId, providerInst);
    this.providerService.registerProvider(providerInst);

    conn.addEventListener(
      events.EventQUICConnectionClose.name,
      (e: events.EventQUICConnectionClose) => {
        this.providerService.deregisterProvider(providerInst.id);
      },
    );
  }
}
