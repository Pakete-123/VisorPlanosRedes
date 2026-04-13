import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FloorsService } from './floors.service';
import { PdfService } from './pdf.service';

class AssignPageDto {
  pageNumber!: number;
  buildingName!: string;
  floorLevel!: number;
  floorName!: string;
  imagePath!: string;
  planWidth!: number;
  planHeight!: number;
}

class PositionDto {
  posX!: number;
  posY!: number;
  posZ!: number;
}

@Controller('projects/:projectId/floors')
export class FloorsController {
  constructor(
    private floorsService: FloorsService,
    private pdfService: PdfService,
  ) {}

  // POST /projects/:projectId/floors/upload-pdf
  @Post('upload-pdf')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          cb(new BadRequestException('Solo se permiten archivos PDF'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB Máximo
    }),
  )
  async uploadPdf(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const pages = await this.pdfService.extractPages(file.path, projectId);
    return { pageCount: pages.length, pages };
  }

  // POST /projects/:projectId/floors/assign-page
  @Post('assign-page')
  async assignPage(
    @Param('projectId') projectId: string,
    @Body() dto: AssignPageDto,
  ) {
    return this.floorsService.assignPage(projectId, dto);
  }

  // GET /projects/:projectId/floors
  @Get()
  async getFloors(@Param('projectId') projectId: string) {
    return this.floorsService.getFloorsWithBuildings(projectId);
  }

  // PATCH /projects/:projectId/floors/:buildingId/position
  @Patch(':buildingId/position')
  async updatePosition(
    @Param('buildingId') buildingId: string,
    @Body() dto: PositionDto,
  ) {
    return this.floorsService.updateBuildingPosition(buildingId, dto);
  }
}
