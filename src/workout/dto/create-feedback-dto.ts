import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFeedbackDto {
  @IsArray()
  exerciseFeedbackArray: ExerciseFeedbackDto[];

  @IsNumber()
  userId: number;

  @IsString()
  sessionTime: string;

  @IsString()
  @IsOptional()
  generalFeedback: string;

  @IsNumber()
  @IsOptional()
  energyLevel: number;

  @IsNumber()
  @IsOptional()
  mood: number;

  @IsNumber()
  @IsOptional()
  perceivedDifficulty: number;

  @IsString()
  @IsOptional()
  additionalNotes: string;
}

class ExerciseFeedbackDto {
  @IsNumber()
  exerciseId: number;

  @IsString()
  @IsOptional()
  rating: string;

  @IsBoolean()
  @IsOptional()
  completed: boolean;

  @IsString()
  @IsOptional()
  comments: string;

  @IsNumber()
  userId: number;
}