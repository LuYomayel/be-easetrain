import { IsString, IsNumber, IsOptional, IsDate, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCycleDto {
  @IsString({ message: 'Name must be a string.' })
  name: string;

  @IsNumber({}, { message: 'Coach ID must be a number.' })
  @Min(1, { message: 'Coach ID must be a positive integer.' })
  coachId: number;

  @Type(() => Date)
  @IsDate({ message: 'Start date must be a valid date.' })
  startDate: Date;

  @IsOptional()
  @IsNumber({}, { message: 'Duration in months must be a number.' })
  @Min(1, { message: 'Duration in months must be at least 1.' })
  durationInMonths?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Duration in weeks must be a number.' })
  @Min(1, { message: 'Duration in weeks must be at least 1.' })
  durationInWeeks?: number;

  @IsNumber({}, { message: 'Client ID must be a number.' })
  @Min(1, { message: 'Client ID must be a positive integer.' })
  clientId: number;
}

class WorkoutAssignmentDto {
  @IsNumber({}, { message: 'Workout ID must be a number.' })
  @Min(1, { message: 'Workout ID must be a positive integer.' })
  workoutId: number;

  @IsNumber({}, { message: 'Day of week must be a number.' })
  @Min(1, { message: 'Day of week must be at least 1 (Monday).' })
  @Max(7, { message: 'Day of week must be at most 7 (Sunday).' })
  dayOfWeek: number;
}

export class AssignWorkoutsToCycleDTO {
  @IsArray({ message: 'Assignments must be an array.' })
  @ValidateNested({ each: true })
  @Type(() => WorkoutAssignmentDto)
  assignments: WorkoutAssignmentDto[];
}