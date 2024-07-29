import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFeedbackDto {
  @IsArray()
  exerciseFeedbackArray: ExerciseFeedbackDto[];

  @IsNumber()
  userId: number;

  @IsString()
  sessionTime: Date;

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

  @IsArray()
  sets: ExerciseSetDto[];

  @IsString()
  @IsOptional()
  rating: string;

  @IsBoolean()
  @IsOptional()
  completed: boolean;

  @IsBoolean()
  @IsOptional()
  completedNotAsPlanned: boolean; // Nuevo campo

  @IsString()
  @IsOptional()
  comments: string;

  @IsNumber()
  userId: number;
}

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