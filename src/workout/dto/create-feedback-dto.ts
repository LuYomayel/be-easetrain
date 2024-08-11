import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsDate,
  ValidateNested,
  Min,
  Max,
  IsNotEmpty,
  Matches
} from 'class-validator';
import { Type } from 'class-transformer';

class ExerciseSetDto {
  @IsString()
  @IsOptional()
  repetitions: string;

  @IsString()
  @IsOptional()
  weight: string;

  @IsString()
  @IsOptional()
  time: string;

  @IsString()
  @IsOptional()
  distance: string;

  @IsString()
  @IsOptional()
  tempo: string;

  @IsString()
  @IsOptional()
  notes: string;

  @IsString()
  @IsOptional()
  difficulty: string;

  @IsString()
  @IsOptional()
  duration: string;

  @IsString()
  @IsOptional()
  restInterval: string;
}

class ExerciseFeedbackDto {
  @IsOptional()
  @IsNumber({}, { message: 'Exercise ID must be a number.' })
  exerciseId: number;

  @IsArray({ message: 'Sets must be an array.' })
  @ValidateNested({ each: true })
  @Type(() => ExerciseSetDto)
  sets: ExerciseSetDto[];

  // @IsString()
  @IsNotEmpty({ message: 'Must select a RPE'})
  rating: string;

  @IsBoolean({ message: 'Completed must be a boolean value.' })
  @IsOptional()
  completed: boolean;

  @IsBoolean({ message: 'CompletedNotAsPlanned must be a boolean value.' })
  @IsOptional()
  completedNotAsPlanned: boolean;

  @IsString()
  @IsOptional()
  comments: string;

  @IsOptional()
  @IsNumber({}, { message: 'User ID must be a number.' })
  userId: number;
}

export class CreateFeedbackDto {
  @IsArray({ message: 'ExerciseFeedbackArray must be an array.' })
  @ValidateNested({ each: true })
  @Type(() => ExerciseFeedbackDto)
  exerciseFeedbackArray: ExerciseFeedbackDto[];

  @IsNumber({}, { message: 'User ID must be a number.' })
  userId: number;

  @IsString({ message: 'Session time must be a string in hh:mm:ss format.' })
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, { message: 'Session time must be in the format hh:mm:ss.' })
  sessionTime: string;

  @IsString()
  @IsOptional()
  generalFeedback: string;

  @IsNumber({}, { message: 'Energy level must be a number.' })
  @IsOptional()
  @Min(0, { message: 'Energy level must be at least 0.' })
  @Max(10, { message: 'Energy level must be at most 10.' })
  energyLevel: number;

  @IsNumber({}, { message: 'Mood must be a number.' })
  @IsOptional()
  @Min(0, { message: 'Mood must be at least 0.' })
  @Max(10, { message: 'Mood must be at most 10.' })
  mood: number;

  @IsNumber({}, { message: 'Perceived difficulty must be a number.' })
  @IsOptional()
  @Min(0, { message: 'Perceived difficulty must be at least 0.' })
  @Max(10, { message: 'Perceived difficulty must be at most 10.' })
  perceivedDifficulty: number;

  @IsString()
  @IsOptional()
  additionalNotes: string;
}