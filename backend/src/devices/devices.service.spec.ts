import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { DevicesService } from './devices.service';
describe('DevicesService', () => {
  let service: DevicesService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: PrismaService,
          useValue: {
            floor: {
              findFirst: jest.fn(),
            },
            device: {
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
            cable: {
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();
    service = module.get<DevicesService>(DevicesService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
