import { PartialType } from '@nestjs/mapped-types';
import {
  IsOptional,
  IsString,
  IsArray,
  IsDate,
  IsNumber,
  ValidateNested,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateWorkoutDto, ExerciseGroupDto, WorkoutStatus } from './create-workout.dto';
import { ClientSubscription } from '../../subscription/entities/client.subscription.entity';
import { Coach, ICoach } from '../../user/entities/coach.entity';
import { ExerciseGroup } from '../../exercise/entities/exercise-group.entity';
import { Workout, WorkoutInstance } from '../entities/workout.entity';

export class UpdateWorkoutDto extends PartialType(CreateWorkoutDto) {
  @IsNumber({}, { message: 'ID must be a number.' })
  @Min(1, { message: 'ID must be a positive integer.' })
  id: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClientSubscription)
  clientSubscription?: ClientSubscription;

  @ValidateNested()
  @Type(() => Coach)
  coach: Coach;

  @IsOptional()
  @IsString({ message: 'Day of week must be a string.' })
  dayOfWeek?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Date must be a valid date.' })
  date?: Date;

  @IsOptional()
  @IsString({ message: 'Start time must be a string.' })
  startTime?: string;

  @IsOptional()
  @IsString({ message: 'End time must be a string.' })
  endTime?: string;

  @IsOptional()
  @IsString({ message: 'Personalized notes must be a string.' })
  personalizedNotes?: string;

  @IsOptional()
  @IsEnum(WorkoutStatus, { message: 'Status must be pending, completed, or in-progress.' })
  status?: WorkoutStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Date completed must be a valid date.' })
  dateCompleted?: Date;

  @IsOptional()
  @IsString({ message: 'Feedback must be a string.' })
  feedback?: string;

  @ValidateNested({ each: true })
  @Type(() => ExerciseGroupDto)
  groups: ExerciseGroupDto[];

  @ValidateNested({ each: true })
  @Type(() => WorkoutInstance)
  workoutInstances: WorkoutInstance[];

  @ValidateNested()
  @Type(() => Workout)
  workout: Workout;
}