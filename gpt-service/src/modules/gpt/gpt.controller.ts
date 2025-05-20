import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { GptService } from './gpt.service';
import { SummarizeLoadsDto } from './dto/summarize-loads.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('gpt')
@Controller()
export class GptController {
  private readonly logger = new Logger(GptController.name);

  constructor(private readonly gptService: GptService) {}

  @Post('summarize-loads')
  @ApiOperation({ summary: 'Summarize load data using GPT' })
  @ApiResponse({ 
    status: 200, 
    description: 'Loads summarized successfully',
    schema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        insights: { 
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async summarizeLoads(@Body() summarizeLoadsDto: SummarizeLoadsDto) {
    this.logger.log(`Received request to summarize ${summarizeLoadsDto.loads.length} loads`);
    
    try {
      return await this.gptService.summarizeLoads(summarizeLoadsDto);
    } catch (error) {
      this.logger.error(`Error in summarize-loads endpoint: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException('Failed to summarize loads', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}