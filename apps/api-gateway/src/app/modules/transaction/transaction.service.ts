/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '@layerg-agg-workspace/shared/services';
import {
  LockNFTBalanceDto,
  MintNftOffchainDto,
  TXResponse,
  TransferNftOffchainDto,
} from '@layerg-agg-workspace/shared/dto';

import {
  MempoolTxDto,
  TransactionType,
} from '@layerg-agg-workspace/shared/dto';
import OtherCommon from '../../commons/Other.common';
import * as elliptic from 'elliptic';
import BN from 'bn.js';
import OtherError from '../../commons/errors/OtherError.error';
import { EErrorCode } from '../../commons/enums/Error.enum';
import { APIKey } from '@prisma/client';
const ec = new elliptic.ec('p256');

@Injectable()
export class TransactionService {
  private client: ClientProxy;

  constructor(private readonly prisma: PrismaService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        host: process.env.REDIS_HOST as string,
        port: process.env.REDIS_PORT as unknown as number,
        username: process.env.REDIS_USERNAME as string,
        password: process.env.REDIS_PASSWORD as string,
      },
    });
  }
  async create(createTransactionDto: CreateTransactionDto) {
    const emission = await this.client.send('tx_queue', createTransactionDto);
    const test = await lastValueFrom(emission);
    return test;
  }

  async mintNftOffchain(mintNftOffchainDto: MintNftOffchainDto, owner: APIKey) {
    // const isValidUAToken = this.isValidUAToken(token);
    // if (!isValidUAToken.isValid) {
    //   throw new UnauthorizedException('Invalid UAToken');
    // }
    const correctNFT = await this.prisma.nFTAsset.findUnique({
      where: {
        id: mintNftOffchainDto.nftId,
      },
      select: {
        collection: {
          select: {
            project: {
              select: {
                apiKeyID: true,
              },
            },
          },
        },
      },
    });
    if (!correctNFT || correctNFT.collection.project.apiKeyID !== owner.id) {
      throw new OtherError({
        errorInfo: {
          code: EErrorCode.INPUT_ERROR,
          message: 'NFT information is invalid',
        },
      });
    }
    const txDto: MempoolTxDto = {
      txType: TransactionType.MINT_NFT,
      rawData: { ...mintNftOffchainDto },
    };
    const emission = await this.client.send<TXResponse, MempoolTxDto>(
      'tx_queue',
      txDto,
    );
    return lastValueFrom(emission);
  }

  async transferNftOffchain(
    transferNftDto: TransferNftOffchainDto,
    token: string,
  ) {
    const isValidUAToken = this.isValidUAToken(token);
    if (!isValidUAToken.isValid) {
      throw new UnauthorizedException('Invalid UAToken');
    }
    if (transferNftDto.from.toLocaleLowerCase() !== isValidUAToken.wallet) {
      throw new OtherError({
        errorInfo: {
          code: EErrorCode.BAD_REQUEST_ERROR,
          message: 'From does not match with UA Token',
        },
      });
    }
    const txDto: MempoolTxDto = {
      txType: TransactionType.TRANSFER_NFT,
      rawData: { ...transferNftDto, from: isValidUAToken.wallet },
    };

    const emission = await this.client.send<TXResponse, MempoolTxDto>(
      'tx_queue',
      txDto,
    );
    return lastValueFrom(emission);
  }

  async lockFn(data: LockNFTBalanceDto, token: string) {
    const isValidUAToken = this.isValidUAToken(token);
    if (!isValidUAToken.isValid) {
      throw new UnauthorizedException('Invalid UAToken');
    }
    const { userAddress, nftAssetId, amountToLock } = data;
    const result = lastValueFrom(
      await this.client.send<TXResponse, LockNFTBalanceDto>('lock', {
        userAddress,
        nftAssetId,
        amountToLock,
      }),
    );
    return result;
  }

  async verify(txHash: string) {
    await this.client.emit<TXResponse, { txHash: string }>('verify', {
      txHash,
    });
  }
  isValidUAToken(UAToken: string): { wallet: string; isValid: boolean } {
    const requester = OtherCommon.parseJwt(UAToken);
    if (requester.exp < new Date().getTime() / 1000) {
      return { wallet: '', isValid: false };
    }
    const validUA = this.isValidSignature(
      process.env.UA_PUBLIC_KEY,
      requester.signature.msg,
      requester.signature.r,
      requester.signature.s,
    );
    if (!validUA) {
      return { wallet: '', isValid: false };
    }
    return { wallet: requester.wallet, isValid: true };
  }

  isValidSignature(
    pubKeyHex: string,
    message: string,
    r: string,
    s: string,
  ): boolean {
    const pubKeyBytes = Buffer.from(pubKeyHex, 'hex');

    // Ensure the public key is uncompressed and valid
    if (pubKeyBytes[0] !== 0x04 || pubKeyBytes.length !== 65) {
      console.error('Invalid public key format');
      return;
    }

    // Extract x and y coordinates from the public key bytes
    const x = new BN(pubKeyBytes.slice(1, 33).toString('hex'), 16);
    const y = new BN(pubKeyBytes.slice(33).toString('hex'), 16);

    // Reconstruct the public key in elliptic format
    // @ts-ignore
    const pubKey = ec.keyFromPublic({ x, y });

    const isValid = this.verifyECDSASignature(pubKey, message, r, s);
    return isValid;
  }

  verifyECDSASignature(
    publicKey: elliptic.ec.KeyPair,
    message: string,
    rStr: string,
    sStr: string,
  ): boolean {
    // Use the message's raw bytes as the hash
    const hash = Buffer.from(message, 'utf8');

    // Convert r and s from hex strings to BN instances
    const r = new BN(rStr, 16);
    const s = new BN(sStr, 16);

    // Verify the signature using the public key
    return publicKey.verify(hash, { r, s });
  }
}
