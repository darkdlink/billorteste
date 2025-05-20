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
var ScraperController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperController = void 0;
const common_1 = require("@nestjs/common");
const scraper_service_1 = require("./scraper.service");
const swagger_1 = require("@nestjs/swagger");
let ScraperController = ScraperController_1 = class ScraperController {
    scraperService;
    logger = new common_1.Logger(ScraperController_1.name);
    constructor(scraperService) {
        this.scraperService = scraperService;
    }
    async runScraper() {
        this.logger.log('Starting scraper run');
        await this.scraperService.scrapeAndProcess();
        return { message: 'Scraping completed successfully' };
    }
    async scrapeJBHunt() {
        const loads = await this.scraperService.scrapeJBHunt();
        return { loads, count: loads.length };
    }
    async scrapeLandstar() {
        const loads = await this.scraperService.scrapeLandstar();
        return { loads, count: loads.length };
    }
};
exports.ScraperController = ScraperController;
__decorate([
    (0, common_1.Post)('run'),
    (0, swagger_1.ApiOperation)({ summary: 'Run the scraper to extract and process loads' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scraping completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "runScraper", null);
__decorate([
    (0, common_1.Get)('jbhunt'),
    (0, swagger_1.ApiOperation)({ summary: 'Scrape loads from JB Hunt only' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'JB Hunt loads' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "scrapeJBHunt", null);
__decorate([
    (0, common_1.Get)('landstar'),
    (0, swagger_1.ApiOperation)({ summary: 'Scrape loads from Landstar only' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Landstar loads' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScraperController.prototype, "scrapeLandstar", null);
exports.ScraperController = ScraperController = ScraperController_1 = __decorate([
    (0, swagger_1.ApiTags)('scraper'),
    (0, common_1.Controller)('scraper'),
    __metadata("design:paramtypes", [scraper_service_1.ScraperService])
], ScraperController);
//# sourceMappingURL=scraper.controller.js.map