import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from './scraper.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Load } from '../../entities/load.entity';
import { Summary } from '../../entities/summary.entity';
import { of } from 'rxjs';

describe('ScraperService', () => {
  let service: ScraperService;
  let httpService: HttpService;

  const mockLoadRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSummaryRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'GPT_SERVICE_URL') {
        return 'http://gpt-service:3001';
      }
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScraperService,
        {
          provide: getRepositoryToken(Load),
          useValue: mockLoadRepository,
        },
        {
          provide: getRepositoryToken(Summary),
          useValue: mockSummaryRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveLoads', () => {
    it('should save loads to the database', async () => {
      const mockLoads = [
        {
          origin: 'Origin 1',
          destination: 'Destination 1',
          price: 1500,
          eta: '2023-06-01T10:00:00.000Z',
          source: 'jbhunt',
          external_id: 'JB-12345',
        },
      ];

      const mockSavedLoad = {
        id: 1,
        origin: 'Origin 1',
        destination: 'Destination 1',
        price: 1500,
        eta: new Date('2023-06-01T10:00:00.000Z'),
        source: 'jbhunt',
        external_id: 'JB-12345',
      };

      mockLoadRepository.create.mockImplementation((dto) => ({
        ...dto,
        id: 1,
      }));

      mockLoadRepository.save.mockResolvedValue(mockSavedLoad);

      const result = await service.saveLoads(mockLoads);

      expect(mockLoadRepository.create).toHaveBeenCalledTimes(1);
      expect(mockLoadRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockSavedLoad]);
    });
  });

  describe('sendToGptService', () => {
    it('should send loads to the GPT service and save summaries', async () => {
      const mockLoads = [
        {
          id: 1,
          origin: 'Origin 1',
          destination: 'Destination 1',
          price: 1500,
          eta: new Date('2023-06-01T10:00:00.000Z'),
          source: 'jbhunt',
          external_id: 'JB-12345',
        },
      ];

      const mockGptResponse = {
        data: {
          summary: 'Test summary',
          insights: ['Insight 1', 'Insight 2'],
        },
      };

      const mockSavedSummary = {
        id: 1,
        load_id: 1,
        summary_text: 'Test summary',
        insights: ['Insight 1', 'Insight 2'],
      };

      mockHttpService.post.mockReturnValue(of(mockGptResponse));

      mockSummaryRepository.create.mockImplementation((dto) => ({
        ...dto,
        id: 1,
      }));

      mockSummaryRepository.save.mockResolvedValue(mockSavedSummary);

      await service.sendToGptService(mockLoads);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        'http://gpt-service:3001/summarize-loads',
        {
          loads: [
            {
              id: 1,
              origin: 'Origin 1',
              destination: 'Destination 1',
              price: 1500,
              eta: new Date('2023-06-01T10:00:00.000Z'),
              source: 'jbhunt',
            },
          ],
        },
      );

      expect(mockSummaryRepository.create).toHaveBeenCalledWith({
        load_id: 1,
        summary_text: 'Test summary',
        insights: ['Insight 1', 'Insight 2'],
      });

      expect(mockSummaryRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});