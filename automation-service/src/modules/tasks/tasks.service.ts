import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScraperService } from '../scraper/scraper.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly scraperService: ScraperService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleScraperCron() {
    this.logger.debug('Running scheduled scraper task');
    try {
      await this.scraperService.scrapeAndProcess();
      this.logger.log('Scheduled scraper task completed successfully');
    } catch (error) {
      this.logger.error(`Scheduled scraper task failed: ${error.message}`, error.stack);
    }
  }
}