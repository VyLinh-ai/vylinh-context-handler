import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtInterceptor } from '../../commons/interceptors/global-jwt.interceptor';
import { CustomRequest } from '../../commons/definitions/GlobalJWT.definition';
import {
  LockNFTBalanceDto,
  MintNftOffchainDto,
  TransferNftOffchainDto,
} from '@layerg-agg-workspace/shared/dto';
import OtherError from '../../commons/errors/OtherError.error';
import { EErrorCode } from '../../commons/enums/Error.enum';
import { JwtAuthGuard } from '../auth/guards/api-key.guard';
import { CurrentAPIKey } from '../../commons/decorators/CurrentAPIKey.decorator';
import { APIKey } from '@prisma/client';
import { HeaderField } from '../../commons/decorators/Header.decorator';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @UseInterceptors(JwtInterceptor)
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() req: CustomRequest,
  ) {
    console.log(req.user.uid);
    return this.transactionService.create(createTransactionDto);
  }

  @Post('mint-nft')
  @UseGuards(JwtAuthGuard)
  async mintNftOffchain(
    @Body() dto: MintNftOffchainDto,
    @CurrentAPIKey() owner: APIKey,
  ) {
    const res = await this.transactionService.mintNftOffchain(dto, owner);
    if (res.status === 'Failed') {
      throw new OtherError({
        errorInfo: {
          code: EErrorCode.TX_ERROR,
          message: res.message,
        },
      });
    }
    return res;
  }

  @Post('transfer-nft')
  async transferNftOffchain(
    @Body() dto: TransferNftOffchainDto,
    @HeaderField('ua-token') token: string,
  ) {
    const res = await this.transactionService.transferNftOffchain(dto, token);
    if (res.status === 'Failed') {
      throw new OtherError({
        errorInfo: {
          code: EErrorCode.TX_ERROR,
          message: res.message,
        },
      });
    }
    return res;
  }

  @Post('lock-nft')
  async lockNftOffchain(
    @Body() dto: LockNFTBalanceDto,
    @HeaderField('ua-token') token: string,
  ) {
    const res = await this.transactionService.lockFn(dto, token);
    if (res.status === 'Failed') {
      throw new OtherError({
        errorInfo: {
          code: EErrorCode.TX_ERROR,
          message: res.message,
        },
      });
    }
    return res;
  }

  @Post('verify')
  async verifyTransaction(@Body('tx_hash') txHash: string) {
    if (!txHash) {
      return { error: 'Transaction hash is required' };
    }
    await this.transactionService.verify(txHash);
    return { message: 'Transaction verification started', status: 'Success' };
  }
}
