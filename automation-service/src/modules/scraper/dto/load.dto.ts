import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoadDto {
  @ApiProperty()
  @IsString()
  origin: string;

  @ApiProperty()
  @IsString()
  destination: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsDateString()
  eta: string;

  @ApiProperty()
  @IsString()
  source: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  external_id?: string;
}