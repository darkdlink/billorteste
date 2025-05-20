import { Repository } from 'typeorm';
import { Load } from '../../entities/load.entity';
import { LoadDto } from './dto/load.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Summary } from '../../entities/summary.entity';
export declare class ScraperService {
    private readonly loadRepository;
    private readonly summaryRepository;
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly loadCounter;
    private readonly scrapeDuration;
    private readonly activeJobs;
    constructor(loadRepository: Repository<Load>, summaryRepository: Repository<Summary>, httpService: HttpService, configService: ConfigService);
    scrapeJBHunt(): Promise<LoadDto[]>;
    scrapeLandstar(): Promise<LoadDto[]>;
    saveLoads(loads: LoadDto[]): Promise<Load[]>;
    sendToGptService(loads: Load[]): Promise<void>;
    scrapeAndProcess(): Promise<void>;
}
