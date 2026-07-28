import { Module } from '@nestjs/common';
import { UpiService } from './upi.service';
import { UpiController } from './upi.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UpiService],
  controllers: [UpiController],
})
export class UpiModule {}
