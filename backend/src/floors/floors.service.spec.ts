import { FloorsService } from './floors.service';
jest.mock(
  'src/prisma/prisma.service',
  () => ({
    PrismaService: class PrismaServiceMock {},
  }),
  { virtual: true },
);
describe('FloorsService', () => {
  let service: FloorsService;
  beforeEach(() => {
    service = new FloorsService({
      building: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      floor: {
        create: jest.fn(),
      },
    } as unknown as ConstructorParameters<typeof FloorsService>[0]);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
