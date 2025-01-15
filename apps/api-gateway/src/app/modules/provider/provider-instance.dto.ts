import { QUICConnection, QUICStream } from '@matrixai/quic';
import { numberToU8Array, readFrom, writeTo } from './utils';
import { Message } from 'ollama';
import { ProviderInfo, HubMessage, HubMessageType } from '../hub/hub.dto';

export class ProviderInstance {
  id: string;
  providerInfo: ProviderInfo;
  quicConn: QUICConnection;

  constructor() {}

  async getProviderInfo(quicConn: QUICConnection): Promise<this> {
    const stream = quicConn.newStream();
    const req: HubMessage = {
      type: HubMessageType.ProviderInfoReq,
    };
    await writeTo(stream, req);
    const res = await readFrom(stream);
    await stream.destroy();
    this.id = res.providerInfoRes.providerId;
    this.providerInfo = res.providerInfoRes;
    this.quicConn = quicConn;
    return this;
  }

  async chat(model: string, messages: Message[]): Promise<HubMessage> {
    const stream = this.quicConn.newStream();

    const hubMsg: HubMessage = {
      type: HubMessageType.ChatReq,
      ollamaChatReq: {
        model,
        messages,
      },
    };
    await writeTo(stream, hubMsg);
    const res = await readFrom(stream);

    await stream.destroy();
    return res;
  }
}
