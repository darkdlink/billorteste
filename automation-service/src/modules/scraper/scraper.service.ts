import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Load } from '../../entities/load.entity';
import { LoadDto } from './dto/load.dto';
import * as puppeteer from 'puppeteer';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Counter, Gauge, Histogram } from 'prom-client';
import { Summary } from '../../entities/summary.entity';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private readonly loadCounter: Counter;
  private readonly scrapeDuration: Histogram;
  private readonly activeJobs: Gauge;

  constructor(
    @InjectRepository(Load)
    private readonly loadRepository: Repository<Load>,
    @InjectRepository(Summary)
    private readonly summaryRepository: Repository<Summary>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    // Initialize Prometheus metrics
    this.loadCounter = new Counter({
      name: 'loads_scraped_total',
      help: 'Total number of loads scraped',
      labelNames: ['source'],
    });

    this.scrapeDuration = new Histogram({
      name: 'scrape_duration_seconds',
      help: 'Duration of scraping operations',
      labelNames: ['source'],
    });

    this.activeJobs = new Gauge({
      name: 'scraper_active_jobs',
      help: 'Number of active scraper jobs',
    });
  }

  async scrapeJBHunt(): Promise<LoadDto[]> {
    this.activeJobs.inc();
    const timer = this.scrapeDuration.startTimer({ source: 'jbhunt' });
    
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.goto('https://www.jbhunt.com/loadboard/load-board/map', {
        waitUntil: 'networkidle2',
      });
      
      this.logger.log('Navigated to JB Hunt load board');
      
      // Implement login if needed
      // await this.login(page);
      
      // Extract load data
      const loads = await page.evaluate(() => {
        // In a real implementation, we would use proper selectors
        // This is a mock implementation for demonstration
        return Array.from({ length: 20 }).map((_, i) => ({
          origin: `Origin City ${i}`,
          destination: `Destination City ${i}`,
          price: 1000 + Math.random() * 2000,
          eta: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'jbhunt',
          external_id: `JB-${Math.floor(Math.random() * 100000)}`,
        }));
      });
      
      await browser.close();
      
      this.loadCounter.inc({ source: 'jbhunt' }, loads.length);
      this.logger.log(`Scraped ${loads.length} loads from JB Hunt`);
      
      return loads;
    } catch (error) {
      this.logger.error(`Error scraping JB Hunt: ${error.message}`, error.stack);
      throw error;
    } finally {
      timer();
      this.activeJobs.dec();
    }
  }

  async scrapeLandstar(): Promise<LoadDto[]> {
    this.activeJobs.inc();
    const timer = this.scrapeDuration.startTimer({ source: 'landstar' });
    
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.goto('https://www.landstaronline.com/loadspublic', {
        waitUntil: 'networkidle2',
      });
      
      this.logger.log('Navigated to Landstar load board');
      
      // Implement login if needed
      // await this.login(page);
      
      // Extract load data
      const loads = await page.evaluate(() => {
        // In a real implementation, we would use proper selectors
        // This is a mock implementation for demonstration
        return Array.from({ length: 20 }).map((_, i) => ({
          origin: `Origin City ${i}`,
          destination: `Destination City ${i}`,
          price: 1000 + Math.random() * 2000,
          eta: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'landstar',
          external_id: `LS-${Math.floor(Math.random() * 100000)}`,
        }));
      });
      
      await browser.close();
      
      this.loadCounter.inc({ source: 'landstar' }, loads.length);
      this.logger.log(`Scraped ${loads.length} loads from Landstar`);
      
      return loads;
    } catch (error) {
      this.logger.error(`Error scraping Landstar: ${error.message}`, error.stack);
      throw error;
    } finally {
      timer();
      this.activeJobs.dec();
    }
  }

  async saveLoads(loads: LoadDto[]): Promise<Load[]> {
    this.logger.log(`Saving ${loads.length} loads to database`);
    
    const savedLoads = await Promise.all(
      loads.map(loadDto => {
        const load = this.loadRepository.create({
          origin: loadDto.origin,
          destination: loadDto.destination,
          price: loadDto.price,
          eta: new Date(loadDto.eta),
          source: loadDto.source,
          external_id: loadDto.external_id,
        });
        return this.loadRepository.save(load);
      }),
    );

    this.logger.log(`Successfully saved ${savedLoads.length} loads`);
    return savedLoads;
  }

  async sendToGptService(loads: Load[]): Promise<void> {
    const gptServiceUrl = this.configService.get<string>('GPT_SERVICE_URL');
    this.logger.log(`Sending ${loads.length} loads to GPT service at ${gptServiceUrl}`);
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${gptServiceUrl}/summarize-loads`, {
          loads: loads.map(load => ({
            id: load.id,
            origin: load.origin,
            destination: load.destination,
            price: load.price,
            eta: load.eta,
            source: load.source,
          })),
        }),
      );
      
      const data = response.data;
      this.logger.log('Successfully received response from GPT service');
      
      // Save summary to the database
      await Promise.all(
        loads.map(async (load) => {
          const summary = this.summaryRepository.create({
            load_id: load.id,
            summary_text: data.summary,
            insights: data.insights,
          });
          
          await this.summaryRepository.save(summary);
        }),
      );
      
      this.logger.log(`Successfully saved summaries for ${loads.length} loads`);
    } catch (error) {
      this.logger.error(`Error sending loads to GPT Service: ${error.message}`, error.stack);
      
      // Implement retry logic with exponential backoff
      if (error.response?.status >= 500) {
        this.logger.log('Server error, attempting retry in 5 seconds...');
        
        // Wait and retry (in a real implementation, use exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 5000));
        await this.sendToGptService(loads);
      } else {
        throw error;
      }
    }
  }

  async scrapeAndProcess(): Promise<void> {
    try {
      // Scrape loads from both sources
      const [jbHuntLoads, landstarLoads] = await Promise.all([
        this.scrapeJBHunt(),
        this.scrapeLandstar(),
      ]);
      
      // Save all loads to the database
      const savedJBHuntLoads = await this.saveLoads(jbHuntLoads);
      const savedLandstarLoads = await this.saveLoads(landstarLoads);
      
      // Send loads to GPT service for processing
      await this.sendToGptService([...savedJBHuntLoads, ...savedLandstarLoads]);
      
      this.logger.log(`Successfully processed ${savedJBHuntLoads.length + savedLandstarLoads.length} loads`);
    } catch (error) {
      this.logger.error(`Error in scrape and process flow: ${error.message}`, error.stack);
      throw error;
    }
  }
}