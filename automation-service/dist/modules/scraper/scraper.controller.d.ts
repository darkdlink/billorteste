import { ScraperService } from './scraper.service';
export declare class ScraperController {
    private readonly scraperService;
    private readonly logger;
    constructor(scraperService: ScraperService);
    runScraper(): Promise<{
        message: string;
    }>;
    scrapeJBHunt(): Promise<{
        loads: import("./dto/load.dto").LoadDto[];
        count: number;
    }>;
    scrapeLandstar(): Promise<{
        loads: import("./dto/load.dto").LoadDto[];
        count: number;
    }>;
}
