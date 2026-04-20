import { Test, TestingModule } from '@nestjs/testing';
import { CablesController } from './cables.controller';
import { CablesService } from './cables.service';
describe('CablesController', () => {
  let controller: CablesController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CablesController],
      providers: [
        {
          provide: CablesService,
          useValue: {
            findByFloor: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<CablesController>(CablesController);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
