import { IsEmail, IsString, IsDate, IsNumber } from 'class-validator';
import { EActivityLevel, EFitnessGoal } from '../entities/client.entity';

export class CreateClientDTO {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString({ each: true })
  fitnessGoal: EFitnessGoal[];

  activityLevel: EActivityLevel;

  @IsDate()
  birthdate: Date;

  @IsString()
  gender: string;

  @IsNumber()
  height: number;

  @IsNumber()
  weight: number;

  @IsNumber()
  coachId: number;
}