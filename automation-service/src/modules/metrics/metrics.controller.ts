import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { register } from 'prom-client';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  private readonly logger = new Logger(MetricsController.name);

  @Get()
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  async getMetrics() {
    this.logger.log('Collecting metrics');
    return register.metrics();
  }
}