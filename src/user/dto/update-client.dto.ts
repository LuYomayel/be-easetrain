import { IsEmail, IsString, IsDate, IsNumber, Matches, Length, ValidateIf, MinLength, MaxLength, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { EActivityLevel, EFitnessGoal } from '../entities/client.entity';

export class UpdateClientDto {
  @IsString({ each: true })
  fitnessGoal: EFitnessGoal[];

  activityLevel: EActivityLevel;

  @IsNumber({}, { message: 'Phone number must be a number.' })
  @Min(1000000, { message: 'Phone number must be between 7 and 11 digits.' })
  @Max(99999999999, { message: 'Phone number must be between 7 and 11 digits.' })
  phoneNumber: number;
}