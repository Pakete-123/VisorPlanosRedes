import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';

class CreateProjectDto {
  name!: string;
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  getProjects() {
    return this.projectsService.findAll();
  }

  @Post()
  createProject(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto.name);
  }

  @Get(':projectId')
  getProject(@Param('projectId') projectId: string) {
    return this.projectsService.findOne(projectId);
  }
}
