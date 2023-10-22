// create-subscription.dto.ts

import { IsNotEmpty, IsNumber } from 'class-validator';
import { ECoachTier } from '../entities/coach.subscription.entity';

export class CreateSubscriptionDTO {
  userId: number;
}

export class CreateCoachSubscriptionDTO {
  @IsNumber()
  @IsNotEmpty()
  coachId: number;

  @IsNumber()
  @IsNotEmpty()
  subscriptionId: number;

  @IsNumber()
  @IsNotEmpty()
  tier: ECoachTier;
}

export class CreateCoachPlanDTO {
  @IsNumber()
  coachId: number;

  @IsNumber()
  subscriptionId: number;

  name: string;

  price: number;

  workoutsPerWeek: number;

  includeMealPlan: boolean;
}

export class CreateClientSubscriptionDTO {
  subscriptionId: number;

  coachPlanId: number;

  clientId: number;

  coachId: number;
}
