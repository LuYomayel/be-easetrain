// src/dto/create-rpe.dto.ts
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

export class CreateRpeDto {
  @IsString()
  name: string;

  @IsNumber()
  minValue: number;

  @IsNumber()
  maxValue: number;

  @IsNumber()
  step: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValueMetaDto)
  valuesMeta?: ValueMetaDto[];
}