// src/dto/update-rpe.dto.ts
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ValueMetaDto {
  @IsNumber()
  value: number;

  @IsString()
  @IsOptional()
  color?: string;  // Color opcional para el valor (e.g., "#FF0000")

  @IsString()
  @IsOptional()
  emoji?: string;  // Emoji opcional para el valor (e.g., "🔥")
}

export class UpdateRpeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  minValue?: number;

  @IsNumber()
  @IsOptional()
  maxValue?: number;

  @IsNumber()
  @IsOptional()
  step?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ValueMetaDto)
  valuesMeta?: ValueMetaDto[];
}