import { Test, TestingModule } from '@nestjs/testing';
import { CablesService } from './cables.service';

describe('CablesService', () => {
  let service: CablesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CablesService],
    }).compile();

    service = module.get<CablesService>(CablesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
