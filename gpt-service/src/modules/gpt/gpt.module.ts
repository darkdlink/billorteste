import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GptController } from './gpt.controller';
import { GptService } from './gpt.service';
import { Load } from '../../entities/load.entity';
import { Summary } from '../../entities/summary.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Load, Summary]),
  ],
  controllers: [GptController],
  providers: [GptService],
  exports: [GptService],
})
export class GptModule {}