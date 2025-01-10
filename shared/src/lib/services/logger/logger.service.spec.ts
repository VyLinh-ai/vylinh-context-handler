import { Test, TestingModule } from '@nestjs/testing';
import { LoggerCustomService } from './logger.service';

describe('LoggerCustomService', () => {
  let service: LoggerCustomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerCustomService],
    }).compile();

    service = module.get<LoggerCustomService>(LoggerCustomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
