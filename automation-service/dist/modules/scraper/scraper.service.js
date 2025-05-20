"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ScraperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const load_entity_1 = require("../../entities/load.entity");
const puppeteer = require("puppeteer");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const prom_client_1 = require("prom-client");
const summary_entity_1 = require("../../entities/summary.entity");
let ScraperService = ScraperService_1 = class ScraperService {
    loadRepository;
    summaryRepository;
    httpService;
    configService;
    logger = new common_1.Logger(ScraperService_1.name);
    loadCounter;
    scrapeDuration;
    activeJobs;
    constructor(loadRepository, summaryRepository, httpService, configService) {
        this.loadRepository = loadRepository;
        this.summaryRepository = summaryRepository;
        this.httpService = httpService;
        this.configService = configService;
        this.loadCounter = new prom_client_1.Counter({
            name: 'loads_scraped_total',
            help: 'Total number of loads scraped',
            labelNames: ['source'],
        });
        this.scrapeDuration = new prom_client_1.Histogram({
            name: 'scrape_duration_seconds',
            help: 'Duration of scraping operations',
            labelNames: ['source'],
        });
        this.activeJobs = new prom_client_1.Gauge({
            name: 'scraper_active_jobs',
            help: 'Number of active scraper jobs',
        });
    }
    async scrapeJBHunt() {
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
            const loads = await page.evaluate(() => {
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
        }
        catch (error) {
            this.logger.error(`Error scraping JB Hunt: ${error.message}`, error.stack);
            throw error;
        }
        finally {
            timer();
            this.activeJobs.dec();
        }
    }
    async scrapeLandstar() {
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
            const loads = await page.evaluate(() => {
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
        }
        catch (error) {
            this.logger.error(`Error scraping Landstar: ${error.message}`, error.stack);
            throw error;
        }
        finally {
            timer();
            this.activeJobs.dec();
        }
    }
    async saveLoads(loads) {
        this.logger.log(`Saving ${loads.length} loads to database`);
        const savedLoads = await Promise.all(loads.map(loadDto => {
            const load = this.loadRepository.create({
                origin: loadDto.origin,
                destination: loadDto.destination,
                price: loadDto.price,
                eta: new Date(loadDto.eta),
                source: loadDto.source,
                external_id: loadDto.external_id,
            });
            return this.loadRepository.save(load);
        }));
        this.logger.log(`Successfully saved ${savedLoads.length} loads`);
        return savedLoads;
    }
    async sendToGptService(loads) {
        const gptServiceUrl = this.configService.get('GPT_SERVICE_URL');
        this.logger.log(`Sending ${loads.length} loads to GPT service at ${gptServiceUrl}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${gptServiceUrl}/summarize-loads`, {
                loads: loads.map(load => ({
                    id: load.id,
                    origin: load.origin,
                    destination: load.destination,
                    price: load.price,
                    eta: load.eta,
                    source: load.source,
                })),
            }));
            const data = response.data;
            this.logger.log('Successfully received response from GPT service');
            await Promise.all(loads.map(async (load) => {
                const summary = this.summaryRepository.create({
                    load_id: load.id,
                    summary_text: data.summary,
                    insights: data.insights,
                });
                await this.summaryRepository.save(summary);
            }));
            this.logger.log(`Successfully saved summaries for ${loads.length} loads`);
        }
        catch (error) {
            this.logger.error(`Error sending loads to GPT Service: ${error.message}`, error.stack);
            if (error.response?.status >= 500) {
                this.logger.log('Server error, attempting retry in 5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                await this.sendToGptService(loads);
            }
            else {
                throw error;
            }
        }
    }
    async scrapeAndProcess() {
        try {
            const [jbHuntLoads, landstarLoads] = await Promise.all([
                this.scrapeJBHunt(),
                this.scrapeLandstar(),
            ]);
            const savedJBHuntLoads = await this.saveLoads(jbHuntLoads);
            const savedLandstarLoads = await this.saveLoads(landstarLoads);
            await this.sendToGptService([...savedJBHuntLoads, ...savedLandstarLoads]);
            this.logger.log(`Successfully processed ${savedJBHuntLoads.length + savedLandstarLoads.length} loads`);
        }
        catch (error) {
            this.logger.error(`Error in scrape and process flow: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ScraperService = ScraperService;
exports.ScraperService = ScraperService = ScraperService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(load_entity_1.Load)),
    __param(1, (0, typeorm_1.InjectRepository)(summary_entity_1.Summary)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        axios_1.HttpService,
        config_1.ConfigService])
], ScraperService);
//# sourceMappingURL=scraper.service.js.map