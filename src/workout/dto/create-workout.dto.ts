import { IExerciseGroup } from 'src/exercise/entities/exercise-group.entity';
import { IClientSubscription } from 'src/subscription/entities/client.subscription.entity';
import { IWorkout } from '../entities/workout.entity';

export class CreateWorkoutDto {
  planName: string;
  dayOfWeek?: string;
  date?: Date;
  groups: IExerciseGroup[];
  coachId: number;
}

export class AssignWorkoutDto {
  clientSubscription: IClientSubscription;
  workouts: IWorkout[]
}
