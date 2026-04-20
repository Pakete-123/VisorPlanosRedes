import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
type CableType = 'CAT6' | 'CAT6A' | 'FIBER' | 'COAX';
interface CreateCableDto {
  fromDeviceId: string;
  toDeviceId: string;
  cableType?: CableType;
  vlan?: number;
  pathPoints?: Array<{ x: number; y?: number; z?: number }>;
  label?: string;
}
@Injectable()
export class CablesService {
  constructor(private readonly prisma: PrismaService) {}
  async findByFloor(projectId: string, floorId: string) {
    await this.assertFloorInProject(projectId, floorId);
    return this.prisma.cable.findMany({
      where: { floorId },
      orderBy: { id: 'asc' },
    });
  }
  async create(projectId: string, floorId: string, dto: CreateCableDto) {
    await this.assertFloorInProject(projectId, floorId);
    if (dto.fromDeviceId === dto.toDeviceId) {
      throw new BadRequestException(
        'El cable debe unir dos dispositivos diferentes',
      );
    }
    const devices = await this.prisma.device.findMany({
      where: {
        id: { in: [dto.fromDeviceId, dto.toDeviceId] },
        floorId,
      },
      select: { id: true },
    });
    if (devices.length !== 2) {
      throw new BadRequestException(
        'Los dispositivos origen y destino deben existir en la misma planta',
      );
    }
    return this.prisma.cable.create({
      data: {
        floorId,
        fromDeviceId: dto.fromDeviceId,
        toDeviceId: dto.toDeviceId,
        cableType: dto.cableType ?? 'CAT6',
        vlan: dto.vlan ?? null,
        pathPoints: dto.pathPoints ?? undefined,
        label: dto.label ?? null,
      },
    });
  }
  async remove(cableId: string) {
    const cable = await this.prisma.cable.findUnique({
      where: { id: cableId },
      select: { id: true },
    });
    if (!cable) {
      throw new NotFoundException('Cable no encontrado');
    }
    return this.prisma.cable.delete({
      where: { id: cableId },
    });
  }
  private async assertFloorInProject(projectId: string, floorId: string) {
    const floor = await this.prisma.floor.findFirst({
      where: { id: floorId, projectId },
      select: { id: true },
    });
    if (!floor) {
      throw new NotFoundException('Planta no encontrada para el proyecto');
    }
  }
}
