import { Test, TestingModule } from '@nestjs/testing';
import { FloorsController } from './floors.controller';
import { FloorsService } from './floors.service';
import { PdfService } from './pdf.service';
jest.mock('./floors.service', () => ({
  FloorsService: class FloorsServiceMock {
    assignPage = jest.fn();
    getFloorsWithBuildings = jest.fn();
    updateBuildingPosition = jest.fn();
  },
}));
jest.mock('./pdf.service', () => ({
  PdfService: class PdfServiceMock {
    extractPages = jest.fn();
  },
}));
describe('FloorsController', () => {
  let controller: FloorsController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FloorsController],
      providers: [
        {
          provide: FloorsService,
          useValue: {
            assignPage: jest.fn(),
            getFloorsWithBuildings: jest.fn(),
            updateBuildingPosition: jest.fn(),
          },
        },
        {
          provide: PdfService,
          useValue: {
            extractPages: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<FloorsController>(FloorsController);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
