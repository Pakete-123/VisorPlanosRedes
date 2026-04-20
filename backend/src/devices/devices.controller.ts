import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DevicesService } from './devices.service';

class CreateDeviceDto {
  name!: string;
  type!: string;
  ip?: string;
  mac?: string;
  vlan?: number;
  switchPort?: number;
  state?: 'ACTIVE' | 'RESERVE' | 'BROKEN';
  notes?: string;
  posX?: number;
  posY?: number;
  posZ?: number;
  rotation?: number;
}

class UpdateDeviceDto {
  name?: string;
  type?: string;
  ip?: string | null;
  mac?: string | null;
  vlan?: number | null;
  switchPort?: number | null;
  state?: 'ACTIVE' | 'RESERVE' | 'BROKEN';
  notes?: string | null;
  rotation?: number;
}

class UpdatePositionDto {
  posX!: number;
  posY!: number;
  posZ!: number;
  rotation?: number;
}

@Controller()
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get('projects/:projectId/floors/:floorId/devices')
  getDevicesByFloor(
    @Param('projectId') projectId: string,
    @Param('floorId') floorId: string,
  ) {
    return this.devicesService.findByFloor(projectId, floorId);
  }

  @Post('projects/:projectId/floors/:floorId/devices')
  createDevice(
    @Param('projectId') projectId: string,
    @Param('floorId') floorId: string,
    @Body() dto: CreateDeviceDto,
  ) {
    return this.devicesService.create(projectId, floorId, dto);
  }

  @Patch('devices/:deviceId')
  updateDevice(
    @Param('deviceId') deviceId: string,
    @Body() dto: UpdateDeviceDto,
  ) {
    return this.devicesService.update(deviceId, dto);
  }

  @Patch('devices/:deviceId/position')
  updateDevicePosition(
    @Param('deviceId') deviceId: string,
    @Body() dto: UpdatePositionDto,
  ) {
    return this.devicesService.updatePosition(deviceId, dto);
  }

  @Delete('devices/:deviceId')
  deleteDevice(@Param('deviceId') deviceId: string) {
    return this.devicesService.remove(deviceId);
  }
}
