import { IExerciseGroup } from 'src/exercise/entities/exercise-group.entity';
import { ICoach } from 'src/user/entities/coach.entity';

export class CreateWorkoutDto {
  planName: string;
  dayOfWeek?: string;
  date?: Date;
  groups: IExerciseGroup[];
  coach: ICoach;
}

export class AssignWorkoutDto {
  planName: string;
  dayOfWeek?: string;
  date?: Date;
  workoutId: number;
  coachId: number;
  clientId: number;
}
