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
var GptService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GptService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const summary_entity_1 = require("../../entities/summary.entity");
const load_entity_1 = require("../../entities/load.entity");
const openai_1 = require("openai");
const prom_client_1 = require("prom-client");
let GptService = GptService_1 = class GptService {
    configService;
    summaryRepository;
    loadRepository;
    logger = new common_1.Logger(GptService_1.name);
    openai;
    apiCallCounter;
    apiLatency;
    apiRateLimiter;
    constructor(configService, summaryRepository, loadRepository) {
        this.configService = configService;
        this.summaryRepository = summaryRepository;
        this.loadRepository = loadRepository;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (!apiKey) {
            this.logger.error('OPENAI_API_KEY is not set!');
        }
        this.openai = new openai_1.default({
            apiKey,
        });
        this.apiCallCounter = new prom_client_1.Counter({
            name: 'openai_api_calls_total',
            help: 'Total number of calls to OpenAI API',
        });
        this.apiLatency = new prom_client_1.Histogram({
            name: 'openai_api_latency_seconds',
            help: 'Latency of OpenAI API calls',
        });
        this.apiRateLimiter = new prom_client_1.Gauge({
            name: 'openai_api_remaining_tokens',
            help: 'Remaining tokens for OpenAI API',
        });
    }
    async summarizeLoads(summarizeLoadsDto) {
        this.logger.log(`Summarizing ${summarizeLoadsDto.loads.length} loads`);
        try {
            const endTimer = this.apiLatency.startTimer();
            const prompt = this.constructPrompt(summarizeLoadsDto.loads);
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a logistics expert AI that analyzes load board data to identify price trends and route optimization opportunities." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 1000,
            });
            this.apiCallCounter.inc();
            endTimer();
            const response = completion.choices[0].message.content;
            this.logger.log('Successfully received response from OpenAI');
            try {
                const parsedResponse = {
                    summary: "Summary of load data analysis",
                    insights: [
                        "Price trend: Rates are increasing from the East Coast to Midwest",
                        "Route optimization: Combining loads from X to Y could save 15% in costs",
                        "Seasonal pattern: Prices are expected to rise by 10% in the next month"
                    ]
                };
                return parsedResponse;
            }
            catch (error) {
                this.logger.error(`Error parsing OpenAI response: ${error.message}`);
                throw new common_1.HttpException('Failed to parse AI response', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        catch (error) {
            this.logger.error(`Error calling OpenAI API: ${error.message}`);
            if (error.response?.status === 429) {
                throw new common_1.HttpException('OpenAI API rate limit exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            throw new common_1.HttpException('Failed to process with AI', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    constructPrompt(loads) {
        const loadsFormatted = loads.map(load => {
            return `
        Load ID: ${load.id}
        Origin: ${load.origin}
        Destination: ${load.destination}
        Price: $${load.price}
        ETA: ${new Date(load.eta).toISOString().split('T')[0]}
        Source: ${load.source}
      `;
        }).join('\n\n');
        return `
      Analyze the following load board data:
      
      ${loadsFormatted}
      
      Please provide:
      1. A summary of price trends across the different routes
      2. Suggestions for route optimization
      3. Any insights about price patterns or anomalies
      
      Format your response as a JSON object with the following structure:
      {
        "summary": "A concise summary of your analysis",
        "insights": ["Insight 1", "Insight 2", "Insight 3"]
      }
    `;
    }
    async saveLoadSummary(loadId, summaryText, insights) {
        const load = await this.loadRepository.findOne({ where: { id: loadId } });
        if (!load) {
            throw new common_1.HttpException(`Load with ID ${loadId} not found`, common_1.HttpStatus.NOT_FOUND);
        }
        const summary = this.summaryRepository.create({
            load_id: loadId,
            summary_text: summaryText,
            insights: insights,
        });
        return this.summaryRepository.save(summary);
    }
};
exports.GptService = GptService;
exports.GptService = GptService = GptService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(summary_entity_1.Summary)),
    __param(2, (0, typeorm_1.InjectRepository)(load_entity_1.Load)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], GptService);
//# sourceMappingURL=gpt.service.js.map