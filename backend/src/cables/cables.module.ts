import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CablesController } from './cables.controller';
import { CablesService } from './cables.service';
@Module({
  imports: [PrismaModule],
  controllers: [CablesController],
  providers: [CablesService],
})
export class CablesModule {}
