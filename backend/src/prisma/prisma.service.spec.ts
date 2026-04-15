import { PrismaService } from './prisma.service';
jest.mock('../generated/prisma/client', () => ({
  PrismaClient: class PrismaClientMock {
    constructor() {}
    async $connect(): Promise<void> {
      return Promise.resolve();
    }
    async $disconnect(): Promise<void> {
      return Promise.resolve();
    }
  },
}));
describe('PrismaService', () => {
  let service: PrismaService;
  const originalDatabaseUrl = process.env.DATABASE_URL;
  beforeAll(() => {
    process.env.DATABASE_URL =
      'postgresql://admin:Admin.1234!@localhost:5432/visorplanosredes_web';
  });
  afterAll(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });
  beforeEach(() => {
    service = new PrismaService();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
