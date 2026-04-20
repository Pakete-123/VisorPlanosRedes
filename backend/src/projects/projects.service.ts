import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(name: string) {
    const normalizedName = name?.trim();
    if (!normalizedName) {
      throw new BadRequestException('El nombre del proyecto es obligatorio');
    }

    return this.prisma.project.create({
      data: { name: normalizedName },
    });
  }

  async findOne(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        buildings: {
          include: {
            floors: { orderBy: { floorLevel: 'asc' } },
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return project;
  }
}
