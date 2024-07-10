// create-subscription.dto.ts

import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

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
  @IsNumber()
  coachPlanId: number;

  @IsNumber()
  coachId: number;

  @IsNumber()
  clientId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
