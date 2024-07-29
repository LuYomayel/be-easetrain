import { ISubcriptionPlan } from '../../subscription/entities/subscription.plan.entity';
import { EActivityLevel, EFitnessGoal } from '../entities/client.entity';
import { ETrainingType } from '../entities/coach.entity';
import { EUserType } from '../entities/user.entity';

export class CreateUserDTO {
  email: string;
  password: string;
  userType: EUserType; // Este podría ser un enum con valores como 'COACH' y 'CLIENT'
}

export class CreateCoachDTO extends CreateUserDTO {
  name: string;
  estimatedClients: number;
  trainingType: ETrainingType[];
  hasGym: boolean;
  gymLocation?: string;
  bio: string;
  experience: string;
  subscriptionPlan: ISubcriptionPlan;
}

