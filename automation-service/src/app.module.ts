import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ScraperModule } from './modules/scraper/scraper.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { Load } from './entities/load.entity';
import { Driver } from './entities/driver.entity';
import { Summary } from './entities/summary.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [Driver, Load, Summary],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    ScraperModule,
    MetricsModule,
  ],
})
export class AppModule {}