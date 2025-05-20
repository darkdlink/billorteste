import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { Load } from '../../entities/load.entity';
import { Summary } from '../../entities/summary.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Load, Summary]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [ScraperController],
  providers: [ScraperService],
  exports: [ScraperService],
})
export class ScraperModule {}