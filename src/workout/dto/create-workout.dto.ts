import { IExerciseGroup } from 'src/exercise/entities/exercise-group.entity';
import { IClientSubscription } from 'src/subscription/entities/client.subscription.entity';
import { IWorkout, IWorkoutInstance } from '../entities/workout.entity';

export class CreateWorkoutDto {
  planName: string;
  dayOfWeek?: string;
  date?: Date;
  workoutInstances: IWorkoutInstance[];
  coachId: number;
}

export class AssignWorkoutDto {
  expectedEndDate: Date;
  expectedStartDate: Date;
  notes: string;
  planId: number;
  studentId: number;
  status: string;
}
