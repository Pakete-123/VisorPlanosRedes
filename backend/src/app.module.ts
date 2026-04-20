import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { FloorsModule } from './floors/floors.module';
import { ProjectsModule } from './projects/projects.module';
import { DevicesModule } from './devices/devices.module';
import { CablesModule } from './cables/cables.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    FloorsModule,
    ProjectsModule,
    DevicesModule,
    CablesModule,
  ],
})
export class AppModule {}
