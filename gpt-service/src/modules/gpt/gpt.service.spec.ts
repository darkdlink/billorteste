import { Test, TestingModule } from '@nestjs/testing';
import { GptService } from './gpt.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Summary } from '../../entities/summary.entity';
import { Load } from '../../entities/load.entity';
import { HttpException } from '@nestjs/common';

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: `{
                    "summary": "Test summary",
                    "insights": ["Insight 1", "Insight 2", "Insight 3"]
                  }`
                }
              }
            ]
          })
        }
      }
    };
  });
});

describe('GptService', () => {
  let service: GptService;

  const mockSummaryRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockLoadRepository = {
    findOne: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'OPENAI_API_KEY') {
        return 'mock-api-key';
      }
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GptService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(Summary),
          useValue: mockSummaryRepository,
        },
        {
          provide: getRepositoryToken(Load),
          useValue: mockLoadRepository,
        },
      ],
    }).compile();

    service = module.get<GptService>(GptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('summarizeLoads', () => {
    it('should call OpenAI API and return summary and insights', async () => {
      const mockLoads = {
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
      };

      const result = await service.summarizeLoads(mockLoads);

      // For this test, we're using the mock implementation that directly returns a predefined response
      expect(result).toBeDefined();
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('insights');
    });
  });

  describe('saveLoadSummary', () => {
    it('should save summary for a load', async () => {
      const loadId = 1;
      const summaryText = 'Test summary';
      const insights = ['Insight 1', 'Insight 2'];

      const mockLoad = {
        id: loadId,
        origin: 'Origin 1',
        destination: 'Destination 1',
      };

      const mockSavedSummary = {
        id: 1,
        load_id: loadId,
        summary_text: summaryText,
        insights: insights,
      };

      mockLoadRepository.findOne.mockResolvedValue(mockLoad);
      mockSummaryRepository.create.mockImplementation((dto) => ({
        ...dto,
        id: 1,
      }));
      mockSummaryRepository.save.mockResolvedValue(mockSavedSummary);

      const result = await service.saveLoadSummary(loadId, summaryText, insights);

      expect(mockLoadRepository.findOne).toHaveBeenCalledWith({ where: { id: loadId } });
      expect(mockSummaryRepository.create).toHaveBeenCalledWith({
        load_id: loadId,
        summary_text: summaryText,
        insights: insights,
      });
      expect(mockSummaryRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockSavedSummary);
    });

    it('should throw an error if load is not found', async () => {
      const loadId = 999;
      const summaryText = 'Test summary';
      const insights = ['Insight 1', 'Insight 2'];

      mockLoadRepository.findOne.mockResolvedValue(null);

      await expect(service.saveLoadSummary(loadId, summaryText, insights)).rejects.toThrow(HttpException);
    });
  });
});