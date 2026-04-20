import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CablesService } from './cables.service';
class CreateCableDto {
  fromDeviceId!: string;
  toDeviceId!: string;
  cableType?: 'CAT6' | 'CAT6A' | 'FIBER' | 'COAX';
  vlan?: number;
  pathPoints?: Array<{ x: number; y?: number; z?: number }>;
  label?: string;
}
@Controller()
export class CablesController {
  constructor(private readonly cablesService: CablesService) {}
  @Get('projects/:projectId/floors/:floorId/cables')
  getCablesByFloor(
    @Param('projectId') projectId: string,
    @Param('floorId') floorId: string,
  ) {
    return this.cablesService.findByFloor(projectId, floorId);
  }
  @Post('projects/:projectId/floors/:floorId/cables')
  createCable(
    @Param('projectId') projectId: string,
    @Param('floorId') floorId: string,
    @Body() dto: CreateCableDto,
  ) {
    return this.cablesService.create(projectId, floorId, dto);
  }
  @Delete('cables/:cableId')
  deleteCable(@Param('cableId') cableId: string) {
    return this.cablesService.remove(cableId);
  }
}
