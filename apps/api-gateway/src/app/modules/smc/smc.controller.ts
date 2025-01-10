import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { SmartContractService } from './smc.service';
import { CreateSmcDto } from './dto/create-smc.dto';
import { SmartContractFilterDto } from './dto/query-smc.dto';

@Controller('smc')
export class SmcController {
  constructor(private readonly smcService: SmartContractService) {}

  @Post()
  create(@Body() createSmcDto: CreateSmcDto) {
    return this.smcService.deployERC721Contract(createSmcDto);
  }
  @Get()
  async getSmartContracts(@Query() filter: SmartContractFilterDto) {
    return this.smcService.getSmartContracts(filter);
  }

  // Endpoint to get details of a single smart contract by ID
  @Get(':id')
  async getSmartContractById(@Param('id') id: string) {
    return this.smcService.getSmartContractById(id);
  }

  // TODO: deploy from created contract
  // TODO: add webhook to x721

  // TODO: update contract info (only allowed when not deployed)
}
