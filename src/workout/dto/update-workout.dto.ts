import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkoutDto } from './create-workout.dto';
import { IClientSubscription } from 'src/subscription/entities/client.subscription.entity';
import { ICoach } from 'src/user/entities/coach.entity';
import { IExerciseGroup } from 'src/exercise/entities/exercise-group.entity';

export class UpdateWorkoutDto {
    id: number;
    clientSubscription?: IClientSubscription;
    coach: ICoach;
    planName: string;
    dayOfWeek?: string;
    date?: Date;
    startTime?: string;
    endTime?: string;
    notes?: string;
    status?: string; // e.g., 'pending', 'completed', 'in-progress'
    dateAssigned: Date;
    dateCompleted?: Date;
    feedback?: string;
    groups: IExerciseGroup[];
  }
