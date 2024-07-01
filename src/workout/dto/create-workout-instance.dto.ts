import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWorkoutInstanceDto {
  @IsNotEmpty()
  workoutId: number;

  @IsNotEmpty()
  userId: number;

  @IsOptional()
  @IsString()
  personalizedNotes?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsNotEmpty()
  @IsDateString()
  dateAssigned: Date;

  @IsOptional()
  @IsDateString()
  dateCompleted?: Date;

  @IsOptional()
  @IsString()
  feedback?: string;
}