import { GptService } from './gpt.service';
import { SummarizeLoadsDto } from './dto/summarize-loads.dto';
export declare class GptController {
    private readonly gptService;
    private readonly logger;
    constructor(gptService: GptService);
    summarizeLoads(summarizeLoadsDto: SummarizeLoadsDto): Promise<{
        summary: string;
        insights: string[];
    }>;
}
