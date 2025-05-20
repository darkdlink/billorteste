import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ScraperController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/scraper/jbhunt (GET)', () => {
    return request(app.getHttpServer())
      .get('/scraper/jbhunt')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('loads');
        expect(res.body).toHaveProperty('count');
        expect(Array.isArray(res.body.loads)).toBe(true);
      });
  });

  it('/scraper/landstar (GET)', () => {
    return request(app.getHttpServer())
      .get('/scraper/landstar')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('loads');
        expect(res.body).toHaveProperty('count');
        expect(Array.isArray(res.body.loads)).toBe(true);
      });
  });

  it('/metrics (GET)', () => {
    return request(app.getHttpServer())
      .get('/metrics')
      .expect(200)
      .expect((res) => {
        expect(typeof res.text).toBe('string');
        expect(res.text).toContain('# HELP');
      });
  });
});