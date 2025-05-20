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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Summary = void 0;
const typeorm_1 = require("typeorm");
const load_entity_1 = require("./load.entity");
let Summary = class Summary {
    id;
    load_id;
    load;
    summary_text;
    insights;
    created_at;
};
exports.Summary = Summary;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Summary.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Summary.prototype, "load_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => load_entity_1.Load),
    (0, typeorm_1.JoinColumn)({ name: 'load_id' }),
    __metadata("design:type", load_entity_1.Load)
], Summary.prototype, "load", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Summary.prototype, "summary_text", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Summary.prototype, "insights", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Summary.prototype, "created_at", void 0);
exports.Summary = Summary = __decorate([
    (0, typeorm_1.Entity)('summaries')
], Summary);
//# sourceMappingURL=summary.entity.js.map