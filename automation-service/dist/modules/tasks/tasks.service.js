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
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const scraper_service_1 = require("../scraper/scraper.service");
let TasksService = TasksService_1 = class TasksService {
    scraperService;
    logger = new common_1.Logger(TasksService_1.name);
    constructor(scraperService) {
        this.scraperService = scraperService;
    }
    async handleScraperCron() {
        this.logger.debug('Running scheduled scraper task');
        try {
            await this.scraperService.scrapeAndProcess();
            this.logger.log('Scheduled scraper task completed successfully');
        }
        catch (error) {
            this.logger.error(`Scheduled scraper task failed: ${error.message}`, error.stack);
        }
    }
};
exports.TasksService = TasksService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "handleScraperCron", null);
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [scraper_service_1.ScraperService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map