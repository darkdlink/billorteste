import { ScraperService } from '../scraper/scraper.service';
export declare class TasksService {
    private readonly scraperService;
    private readonly logger;
    constructor(scraperService: ScraperService);
    handleScraperCron(): Promise<void>;
}
