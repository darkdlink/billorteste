import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LoadDto } from './load.dto';

export class SummarizeLoadsDto {
  @ApiProperty({ type: [LoadDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoadDto)
  loads: LoadDto[];
}