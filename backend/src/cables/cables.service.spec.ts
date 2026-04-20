import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CablesService } from './cables.service';
describe('CablesService', () => {
  let service: CablesService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CablesService,
        {
          provide: PrismaService,
          useValue: {
            floor: {
              findFirst: jest.fn(),
            },
            device: {
              findMany: jest.fn(),
            },
            cable: {
              findMany: jest.fn(),
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();
    service = module.get<CablesService>(CablesService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
