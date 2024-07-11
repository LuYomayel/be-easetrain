import { IsEmail, IsString, IsDate, IsNumber } from 'class-validator';
import { EActivityLevel, EFitnessGoal } from '../entities/client.entity';

export class UpdateClientDto {
  @IsString()
  name: string;

  @IsString({ each: true })
  fitnessGoal: EFitnessGoal[];

  activityLevel: EActivityLevel;

  @IsDate()
  birthdate: Date;

  @IsNumber()
  height: number;

  @IsNumber()
  weight: number;

  @IsNumber()
  phoneNumber: number;
}