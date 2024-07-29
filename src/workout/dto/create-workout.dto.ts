import { IExerciseGroup } from '../../exercise/entities/exercise-group.entity';
import { IClientSubscription } from '../../subscription/entities/client.subscription.entity';
import { IWorkout, IWorkoutInstance } from '../entities/workout.entity';

export class CreateWorkoutDto {
  workout: IWorkout;

  isTemplate: boolean;
  dateAssigned: Date;
  dateCompleted?: Date;
  expectedStartDate?: Date;
  expectedEndDate?: Date;
  feedback?: string;
  instanceName: string;
  personalizedNotes?: string;
  realStartedDate?: Date;
  realEndDate?: Date;
  repeatDays: string[];
  status?: string;
  groups: IExerciseGroup[];
  isRepetead: boolean;
}

export class AssignWorkoutDto {
  expectedEndDate: Date;
  expectedStartDate: Date;
  notes: string;
  planId: number;
  studentId: number;
  status: string;
  instanceName: string;
}
