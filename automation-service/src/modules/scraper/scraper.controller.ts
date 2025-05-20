import { Controller, Get, Post, Logger } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('scraper')
@Controller('scraper')
export class ScraperController {
  private readonly logger = new Logger(ScraperController.name);

  constructor(private readonly scraperService: ScraperService) {}

  @Post('run')
  @ApiOperation({ summary: 'Run the scraper to extract and process loads' })
  @ApiResponse({ status: 200, description: 'Scraping completed successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async runScraper() {
    this.logger.log('Starting scraper run');
    await this.scraperService.scrapeAndProcess();
    return { message: 'Scraping completed successfully' };
  }

  @Get('jbhunt')
  @ApiOperation({ summary: 'Scrape loads from JB Hunt only' })
  @ApiResponse({ status: 200, description: 'JB Hunt loads' })
  async scrapeJBHunt() {
    const loads = await this.scraperService.scrapeJBHunt();
    return { loads, count: loads.length };
  }

  @Get('landstar')
  @ApiOperation({ summary: 'Scrape loads from Landstar only' })
  @ApiResponse({ status: 200, description: 'Landstar loads' })
  async scrapeLandstar() {
    const loads = await this.scraperService.scrapeLandstar();
    return { loads, count: loads.length };
  }
}