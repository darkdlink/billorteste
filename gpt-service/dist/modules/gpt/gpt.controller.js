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
var GptController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GptController = void 0;
const common_1 = require("@nestjs/common");
const gpt_service_1 = require("./gpt.service");
const summarize_loads_dto_1 = require("./dto/summarize-loads.dto");
const swagger_1 = require("@nestjs/swagger");
let GptController = GptController_1 = class GptController {
    gptService;
    logger = new common_1.Logger(GptController_1.name);
    constructor(gptService) {
        this.gptService = gptService;
    }
    async summarizeLoads(summarizeLoadsDto) {
        this.logger.log(`Received request to summarize ${summarizeLoadsDto.loads.length} loads`);
        try {
            return await this.gptService.summarizeLoads(summarizeLoadsDto);
        }
        catch (error) {
            this.logger.error(`Error in summarize-loads endpoint: ${error.message}`);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to summarize loads', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.GptController = GptController;
__decorate([
    (0, common_1.Post)('summarize-loads'),
    (0, swagger_1.ApiOperation)({ summary: 'Summarize load data using GPT' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [summarize_loads_dto_1.SummarizeLoadsDto]),
    __metadata("design:returntype", Promise)
], GptController.prototype, "summarizeLoads", null);
exports.GptController = GptController = GptController_1 = __decorate([
    (0, swagger_1.ApiTags)('gpt'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [gpt_service_1.GptService])
], GptController);
//# sourceMappingURL=gpt.controller.js.map