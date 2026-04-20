import { Module } from '@nestjs/common';
import { CablesService } from './cables.service';
import { CablesController } from './cables.controller';

@Module({
  providers: [CablesService],
  controllers: [CablesController]
})
export class CablesModule {}
