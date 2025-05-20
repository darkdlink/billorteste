import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('GptController (e2e)', () => {
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

  it('/summarize-loads (POST)', () => {
    const mockLoads = {
      loads: [
        {
          id: 1,
          origin: 'Origin 1',
          destination: 'Destination 1',
          price: 1500,
          eta: '2023-06-01T10:00:00.000Z',
          source: 'jbhunt',
        },
      ],
    };

    return request(app.getHttpServer())
      .post('/summarize-loads')
      .send(mockLoads)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('summary');
        expect(res.body).toHaveProperty('insights');
        expect(Array.isArray(res.body.insights)).toBe(true);
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