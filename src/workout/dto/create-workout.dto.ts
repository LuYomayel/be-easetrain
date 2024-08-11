import { 
  IsBoolean, 
  IsDate, 
  IsOptional, 
  IsString, 
  IsArray, 
  ValidateNested, 
  IsEnum, 
  IsNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExerciseGroup } from '../../exercise/entities/exercise-group.entity';
import { Workout, WorkoutInstance } from '../entities/workout.entity';
import { IsNumber } from 'class-validator';

export enum WorkoutStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  IN_PROGRESS = 'in-progress'
}
import {  IsInt, Min } from 'class-validator';
import { Exercise, ExerciseInstance } from 'src/exercise/entities/exercise.entity';

export class ExerciseSetLogDto {
  @IsInt({ message: 'ID must be an integer.' })
  id: number; // Identificador único del set log

  @ValidateNested({ each: true })
  @Type(() => WorkoutInstance) 
  workoutInstance: WorkoutInstance; // ID de la instancia del entrenamiento al que pertenece este log

  @ValidateNested({ each: true })
  @Type(() => ExerciseInstance) 
  exerciseInstance: ExerciseInstance; // ID de la instancia del ejercicio al que pertenece este log

  @IsOptional()
  restInterval?: string;

  @IsInt({ message: 'Exercise ID must be an integer.' })
  exerciseId: number; // ID del ejercicio
  // @IsNumber({}, { message: 'Set number must be a number.' })
  setNumber: number; // Número de set, por ejemplo, 1, 2, 3, etc.

  // @IsNumber({}, { message: 'Repetitions must be a number.' })
  repetitions: string; // Número de repeticiones completadas en el set

  // @IsNumber({}, { message: 'Weight must be a number.' })
  weight: string; // Peso utilizado en el set

  // @IsNumber({}, { message: 'Time must be a number.' })
  @IsOptional()
  time?: string; // Tiempo total del set, si aplica

  // @IsString({ message: 'Notes must be a string.' })
  @IsOptional()
  notes?: string; // Notas adicionales sobre el set

  @IsNumber({}, { message: 'RPE must be a number.' })
  @IsOptional()
  rpe?: number; // Escala de esfuerzo percibido (Rate of Perceived Exertion)

  // @IsNumber({}, { message: 'Tempo must be a number.' })
  @IsOptional()
  tempo?: string; // Tempo del ejercicio en el set, si aplica

  // @IsString({ message: 'Difficulty must be a string.' })
  @IsOptional()
  difficulty?: string; // Dificultad percibida del set

  // @IsNumber({}, { message: 'Duration must be a number.' })
  @IsOptional()
  duration?: string; // Duración total del set

  // @IsNumber({}, { message: 'Distance must be a number.' })
  @IsOptional()
  distance?: string; // Distancia recorrida durante el set, si aplica
}

export class ExerciseInstanceDto {
  
  @IsOptional()
  id: number;

  @ValidateNested({ each: true })
  @Type(() => ExerciseGroup) 
  group: ExerciseGroup;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Exercise) // Asegúrate de tener un DTO para los logs de sets
  exercise: Exercise; 

  @IsOptional()
  // @IsNumber({}, { message: 'Repetitions must be a number.' })
  repetitions?: string;

  @IsOptional()
  // @IsNumber({}, { message: 'Sets must be a number.' })
  sets?: string;

  @IsOptional()
  // @IsNumber({}, { message: 'Time must be a number.' })
  time?: string;

  @IsOptional()
  // @IsNumber({}, { message: 'Weight must be a number.' })
  weight?: string;

  @IsOptional()
  // @IsNumber({}, { message: 'Rest interval must be a number.' })
  restInterval?: string;

  @IsOptional()
  @IsString({ message: 'Tempo must be a string.' })
  @IsOptional()
  tempo?: string;

  @IsOptional()
  @IsString({ message: 'Notes must be a string.' })
  @IsOptional()
  notes?: string;

  @IsOptional()
  @IsString({ message: 'Difficulty must be a string.' })
  @IsOptional()
  difficulty?: string;

  // @IsNumber({}, { message: 'Duration must be a number.' })
  @IsOptional()
  duration?: string;

  // @IsNumber({}, { message: 'Distance must be a number.' })
  @IsOptional()
  distance?: string;

  @IsBoolean({ message: 'Completed must be a boolean value.' })
  @IsOptional()
  completed?: boolean;

  @IsBoolean({ message: 'Completed not as planned must be a boolean value.' })
  @IsOptional()
  completedNotAsPlanned: boolean;

  @IsString({ message: 'RPE must be a string.' })
  @IsOptional()
  rpe?: string;

  @IsString({ message: 'Comments must be a string.' })
  @IsOptional()
  comments?: string;

  @IsArray({ message: 'Set logs must be an array.' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExerciseSetLogDto) // Asegúrate de tener un DTO para los logs de sets
  setLogs?: ExerciseSetLogDto[];
}

export class ExerciseGroupDto {
  @IsOptional()
  @IsNumber({}, { message: 'ID must be a number.' })
  id: number;

  @ValidateNested({ each: true })
  @Type(() => WorkoutInstance) 
  workoutInstance: WorkoutInstance;

  @IsNotEmpty()
  // @IsNumber({}, { message: 'Set must be a number.' })
  set: number;

  @IsNotEmpty()
  // @IsNumber({}, { message: 'Rest must be a number.' })
  rest: number;

  @IsNumber({}, { message: 'Group number must be a number.' })
  @IsNotEmpty()
  groupNumber: number;

  @IsArray({ message: 'Exercises must be an array.' })
  @ValidateNested({ each: true })
  @Type(() => ExerciseInstanceDto) // Valida cada instancia de ejercicio
  exercises: ExerciseInstanceDto[];
}

export class CreateWorkoutDto {
  @ValidateNested()
  @Type(() => Workout)
  workout: Workout;

  @IsBoolean({ message: 'isTemplate must be a boolean value.' })
  isTemplate: boolean;

  @IsOptional()
  @IsString({ message: 'Feedback must be a string.' })
  feedback?: string;

  @IsString({ message: 'Instance name must be a string.' })
  instanceName: string;

  @IsOptional()
  @IsString({ message: 'Personalized notes must be a string.' })
  personalizedNotes?: string;

  @IsArray({ message: 'Groups must be an array.' })
  @ValidateNested({ each: true })
  @Type(() => ExerciseGroupDto) // Usa el DTO de grupo de ejercicios
  groups: ExerciseGroupDto[];
}


export class AssignWorkoutDto {
  @Type(() => Date)
  @IsDate({ message: 'expectedEndDate must be a valid date.' })
  expectedEndDate: Date;

  @Type(() => Date)
  @IsDate({ message: 'expectedStartDate must be a valid date.' })
  expectedStartDate: Date;

  @IsString({ message: 'notes must be a string.' })
  notes: string;

  @IsInt({ message: 'planId must be an integer.' })
  @Min(1, { message: 'planId must be a positive integer.' })
  planId: number;

  @IsInt({ message: 'studentId must be an integer.' })
  @Min(1, { message: 'studentId must be a positive integer.' })
  studentId: number;

  @IsString({ message: 'status must be a string.' })
  status: string;

  @IsString({ message: 'instanceName must be a string.' })
  instanceName: string;
}