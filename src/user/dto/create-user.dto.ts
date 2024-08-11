import { ISubcriptionPlan } from '../../subscription/entities/subscription.plan.entity';
import { EActivityLevel, EFitnessGoal } from '../entities/client.entity';
import { ETrainingType } from '../entities/coach.entity';

import { IsEmail, IsString, Length, IsEnum } from 'class-validator';
import { IsBoolean, IsOptional, IsInt, Min, Max, IsArray } from 'class-validator';
import { EUserType } from '../entities/user.entity';
import { Type } from 'class-transformer';

export class CreateUserDTO {
  @IsEmail({}, { message: 'Invalid email address.' })
  email: string;

  @IsString({ message: 'Password must be a string.' })
  @Length(6, 50, { message: 'Password must be between 6 and 50 characters.' })
  password: string;

  @IsEnum(EUserType, { message: 'User type must be CLIENT or COACH.' })
  userType: EUserType;
}

export class CreateCoachDTO extends CreateUserDTO {
  @IsString({ message: 'Name must be a string.' })
  name: string;

  @IsInt({ message: 'Estimated clients must be an integer.' })
  @Min(0, { message: 'Estimated clients must be at least 0.' })
  estimatedClients: number;

  @IsArray({ message: 'Training type must be an array.' })
  @IsEnum(ETrainingType, { each: true, message: 'Invalid training type.' })
  trainingType: ETrainingType[];

  @IsBoolean({ message: 'Has gym must be a boolean value.' })
  hasGym: boolean;

  @IsOptional()
  @IsString({ message: 'Gym location must be a string.' })
  gymLocation?: string;

  @IsString({ message: 'Bio must be a string.' })
  bio: string;

  @IsString({ message: 'Experience must be a string.' })
  experience: string;
  
  subscriptionPlan: ISubcriptionPlan;
}

