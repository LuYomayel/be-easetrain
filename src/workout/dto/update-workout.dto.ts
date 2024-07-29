import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkoutDto } from './create-workout.dto';
import { IClientSubscription } from '../../subscription/entities/client.subscription.entity';
import { ICoach } from '../../user/entities/coach.entity';
import { IExerciseGroup } from '../../exercise/entities/exercise-group.entity';
import { IWorkout, IWorkoutInstance } from '../entities/workout.entity';

export class UpdateWorkoutDto {
  id: number;
  clientSubscription?: IClientSubscription;
  coach: ICoach;
  planName: string;
  dayOfWeek?: string;
  date?: Date;
  startTime?: string;
  endTime?: string;
  personalizedNotes?: string;
  status?: string; // e.g., 'pending', 'completed', 'in-progress'
  dateAssigned: Date;
  dateCompleted?: Date;
  feedback?: string;
  groups: IExerciseGroup[];
  workoutInstances: IWorkoutInstance[];
  workout: IWorkout;
}
