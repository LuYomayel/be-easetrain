import { IExerciseGroup } from 'src/exercise/entities/exercise-group.entity';

export class CreateWorkoutDto {
  planName: string;
  dayOfWeek?: string;
  date?: Date;
  groups: IExerciseGroup[];
}

export class AssignWorkoutDto {
  planName: string;
  dayOfWeek?: string;
  date?: Date;
  workoutId: number;
  coachId: number;
}
