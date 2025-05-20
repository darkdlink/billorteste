import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ScraperModule } from '../scraper/scraper.module';

@Module({
  imports: [ScraperModule],
  providers: [TasksService],
})
export class TasksModule {}