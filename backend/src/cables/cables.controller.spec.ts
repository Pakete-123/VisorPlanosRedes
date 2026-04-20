import { Test, TestingModule } from '@nestjs/testing';
import { CablesController } from './cables.controller';

describe('CablesController', () => {
  let controller: CablesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CablesController],
    }).compile();

    controller = module.get<CablesController>(CablesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
