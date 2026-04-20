import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

type DeviceState = 'ACTIVE' | 'RESERVE' | 'BROKEN';

interface CreateDeviceDto {
  name: string;
  type: string;
  ip?: string;
  mac?: string;
  vlan?: number;
  switchPort?: number;
  state?: DeviceState;
  notes?: string;
  posX?: number;
  posY?: number;
  posZ?: number;
  rotation?: number;
}
interface UpdateDeviceDto {
  name?: string;
  type?: string;
  ip?: string | null;
  mac?: string | null;
  vlan?: number | null;
  switchPort?: number | null;
  state?: DeviceState;
  notes?: string | null;
  rotation?: number;
}
interface UpdatePositionDto {
  posX: number;
  posY: number;
  posZ: number;
  rotation?: number;
}

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByFloor(projectId: string, floorId: string) {
    await this.assertFloorInProject(projectId, floorId);

    return this.prisma.device.findMany({
      where: { floorId },
      orderBy: { name: 'asc' },
    });
  }

  async create(projectId: string, floorId: string, dto: CreateDeviceDto) {
    await this.assertFloorInProject(projectId, floorId);

    const name = dto.name?.trim();
    if (!name) {
      throw new BadRequestException('El nombre del dispositivo es obligatorio');
    }

    return this.prisma.device.create({
      data: {
        floorId,
        name,
        type: dto.type?.trim() || 'PC',
        ip: dto.ip ?? null,
        mac: dto.mac ?? null,
        vlan: dto.vlan ?? null,
        switchPort: dto.switchPort ?? null,
        state: dto.state ?? 'ACTIVE',
        notes: dto.notes ?? null,
        posX: dto.posX ?? 0,
        posY: dto.posY ?? 0,
        posZ: dto.posZ ?? 0,
        rotation: dto.rotation ?? 0,
      },
    });
  }

  async update(deviceId: string, dto: UpdateDeviceDto) {
    await this.assertDeviceExists(deviceId);

    return this.prisma.device.update({
      where: { id: deviceId },
      data: {
        name: dto.name,
        type: dto.type,
        ip: dto.ip,
        mac: dto.mac,
        vlan: dto.vlan,
        switchPort: dto.switchPort,
        state: dto.state,
        notes: dto.notes,
        rotation: dto.rotation,
      },
    });
  }

  async updatePosition(deviceId: string, dto: UpdatePositionDto) {
    await this.assertDeviceExists(deviceId);

    return this.prisma.device.update({
      where: { id: deviceId },
      data: {
        posX: dto.posX,
        posY: dto.posY,
        posZ: dto.posZ,
        rotation: dto.rotation,
      },
    });
  }

  async remove(deviceId: string) {
    await this.assertDeviceExists(deviceId);

    await this.prisma.cable.deleteMany({
      where: { OR: [{ fromDeviceId: deviceId }, { toDeviceId: deviceId }] },
    });

    return this.prisma.device.delete({
      where: { id: deviceId },
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

  private async assertDeviceExists(deviceId: string) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
      select: { id: true },
    });
    if (!device) {
      throw new NotFoundException('Dispositivo no encontrado');
    }
  }
}
