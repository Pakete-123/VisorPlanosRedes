import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface AssignPageDto {
  pageNumber: number;
  buildingName: string;
  floorLevel: number;
  floorName: string;
  imagePath: string;
  planWidth: number;
  planHeight: number;
}

interface PositionDto {
  posX: number;
  posY: number;
  posZ: number;
}

@Injectable()
export class FloorsService {
  constructor(private prisma: PrismaService) {}

  async assignPage(projectId: string, dto: AssignPageDto) {
    // Buscar o crear el edificio por nombre
    let building = await this.prisma.building.findFirst({
      where: { projectId, name: dto.buildingName },
    });

    if (!building) {
      // Separar edificios automáticamente en el espacio 3D
      const existingBuildings = await this.prisma.building.findMany({
        where: { projectId },
      });
      building = await this.prisma.building.create({
        data: {
          projectId,
          name: dto.buildingName,
          posX: existingBuildings.length * 30, // Cada edificio separado 30 unidades
          posY: 0,
          posZ: 0,
        },
      });
    }

    // Crear la planta asociada al edificio
    return this.prisma.floor.create({
      data: {
        projectId,
        buildingId: building.id,
        name: dto.floorName,
        floorLevel: dto.floorLevel,
        order: dto.floorLevel,
        floorPlanUrl: dto.imagePath.replace(/\\/g, '/'), // Normalizar separadores Windows
        planWidth: dto.planWidth,
        planHeight: dto.planHeight,
      },
    });
  }

  async getFloorsWithBuildings(projectId: string) {
    // Devolver edificios con sus plantas anidadas
    return this.prisma.building.findMany({
      where: { projectId },
      include: {
        floors: {
          orderBy: { floorLevel: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async updateBuildingPosition(buildingId: string, dto: PositionDto) {
    return this.prisma.building.update({
      where: { id: buildingId },
      data: { posX: dto.posX, posY: dto.posY, posZ: dto.posZ },
    });
  }
}
