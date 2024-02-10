import { EActivityLevel, EFitnessGoal } from '../entities/client.entity';
import { ETrainingType } from '../entities/coach.entity';
import { EUserType } from '../entities/user.entity';

export class CreateUserDTO {
  email: string;
  password: string;
  userType: EUserType; // Este podría ser un enum con valores como 'COACH' y 'CLIENT'
}

export class CreateCoachDTO extends CreateUserDTO {
  idUser: number;
  name: string;
  estimatedClients: number;
  trainingType: ETrainingType[];
  hasGym: boolean;
  gymLocation: string;
}

export class CreateClientDTO extends CreateUserDTO {
  idUser: number;
  coachId: number;
  fitnessGoal: EFitnessGoal[];
  activityLevel: EActivityLevel;
  height: number;
  weight: number;
  birthdate: Date;
  gender: string;
  // medicalHistory: string;
  // trainningPreference: string;
}
