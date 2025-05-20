import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { SummarizeLoadsDto } from './dto/summarize-loads.dto';
import { Summary } from '../../entities/summary.entity';
import { Load } from '../../entities/load.entity';
export declare class GptService {
    private readonly configService;
    private readonly summaryRepository;
    private readonly loadRepository;
    private readonly logger;
    private readonly openai;
    private readonly apiCallCounter;
    private readonly apiLatency;
    private readonly apiRateLimiter;
    constructor(configService: ConfigService, summaryRepository: Repository<Summary>, loadRepository: Repository<Load>);
    summarizeLoads(summarizeLoadsDto: SummarizeLoadsDto): Promise<{
        summary: string;
        insights: string[];
    }>;
    private constructPrompt;
    saveLoadSummary(loadId: number, summaryText: string, insights: any[]): Promise<Summary>;
}
