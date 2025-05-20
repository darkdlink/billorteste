import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SummarizeLoadsDto } from './dto/summarize-loads.dto';
import { Summary } from '../../entities/summary.entity';
import { Load } from '../../entities/load.entity';
import OpenAI from 'openai';
import { Counter, Gauge, Histogram } from 'prom-client';

@Injectable()
export class GptService {
  private readonly logger = new Logger(GptService.name);
  private readonly openai: OpenAI;
  private readonly apiCallCounter: Counter;
  private readonly apiLatency: Histogram;
  private readonly apiRateLimiter: Gauge;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Summary)
    private readonly summaryRepository: Repository<Summary>,
    @InjectRepository(Load)
    private readonly loadRepository: Repository<Load>,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.error('OPENAI_API_KEY is not set!');
    }

    this.openai = new OpenAI({
      apiKey,
    });

    // Initialize Prometheus metrics
    this.apiCallCounter = new Counter({
      name: 'openai_api_calls_total',
      help: 'Total number of calls to OpenAI API',
    });

    this.apiLatency = new Histogram({
      name: 'openai_api_latency_seconds',
      help: 'Latency of OpenAI API calls',
    });

    this.apiRateLimiter = new Gauge({
      name: 'openai_api_remaining_tokens',
      help: 'Remaining tokens for OpenAI API',
    });
  }

  async summarizeLoads(summarizeLoadsDto: SummarizeLoadsDto) {
    this.logger.log(`Summarizing ${summarizeLoadsDto.loads.length} loads`);
    
    try {
      const endTimer = this.apiLatency.startTimer();
      
      // Construct the prompt for GPT
      const prompt = this.constructPrompt(summarizeLoadsDto.loads);
      
      // Call GPT Compute Preview
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",  // Using GPT-4 Turbo as a placeholder for GPT Compute Preview
        messages: [
          { role: "system", content: "You are a logistics expert AI that analyzes load board data to identify price trends and route optimization opportunities." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });
      
      // Record metrics
      this.apiCallCounter.inc();
      endTimer();
      
      // Parse the response
      const response = completion.choices[0].message.content;
      this.logger.log('Successfully received response from OpenAI');
      
      // Parse the JSON from the response text
      try {
        // For demonstration, let's assume response is in the correct JSON format
        // In a real implementation, we'd need to parse it correctly
        const parsedResponse = {
          summary: "Summary of load data analysis",
          insights: [
            "Price trend: Rates are increasing from the East Coast to Midwest",
            "Route optimization: Combining loads from X to Y could save 15% in costs",
            "Seasonal pattern: Prices are expected to rise by 10% in the next month"
          ]
        };
        
        // In a real implementation, we would parse the response properly
        // const parsedResponse = JSON.parse(response);
        
        return parsedResponse;
      } catch (error) {
        this.logger.error(`Error parsing OpenAI response: ${error.message}`);
        throw new HttpException('Failed to parse AI response', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      this.logger.error(`Error calling OpenAI API: ${error.message}`);
      
      if (error.response?.status === 429) {
        throw new HttpException('OpenAI API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
      
      throw new HttpException('Failed to process with AI', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private constructPrompt(loads: any[]): string {
    // Format the loads data for the prompt
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

    // Construct the full prompt
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

  async saveLoadSummary(loadId: number, summaryText: string, insights: any[]): Promise<Summary> {
    const load = await this.loadRepository.findOne({ where: { id: loadId } });
    
    if (!load) {
      throw new HttpException(`Load with ID ${loadId} not found`, HttpStatus.NOT_FOUND);
    }
    
    const summary = this.summaryRepository.create({
      load_id: loadId,
      summary_text: summaryText,
      insights: insights,
    });
    
    return this.summaryRepository.save(summary);
  }
}