// create-subscription.dto.ts

import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { Min } from 'class-validator';

export class CreateSubscriptionDTO {
  @IsNumber({}, { message: 'User ID must be a number.' })
  @Min(1, { message: 'User ID must be a positive integer.' })
  userId: number;
}

export class CreateCoachSubscriptionDTO {
  @IsNumber({}, { message: 'Coach ID must be a number.' })
  @Min(1, { message: 'Coach ID must be a positive integer.' })
  coachId: number;

  @IsNumber({}, { message: 'Subscription ID must be a number.' })
  @Min(1, { message: 'Subscription ID must be a positive integer.' })
  subscriptionId: number;
}

export class CreateCoachPlanDTO {
  @IsNumber({}, { message: 'Coach ID must be a number.' })
  @Min(1, { message: 'Coach ID must be a positive integer.' })
  coachId: number;

  @IsString({ message: 'Name must be a string.' })
  @IsNotEmpty({ message: 'Name cannot be empty.' })
  name: string;

  @IsNumber({}, { message: 'Price must be a number.' })
  @Min(0, { message: 'Price must be a non-negative number.' })
  price: number;

  @IsNumber({}, { message: 'Workouts per week must be a number.' })
  @Min(1, { message: 'Workouts per week must be at least 1.' })
  workoutsPerWeek: number;

  @IsBoolean({ message: 'Include meal plan must be a boolean value.' })
  includeMealPlan: boolean;
}

export class CreateClientSubscriptionDTO {
  @IsNumber({}, { message: 'Coach plan ID must be a number.' })
  @Min(1, { message: 'Coach plan ID must be a positive integer.' })
  coachPlanId: number;

  @IsNumber({}, { message: 'Coach ID must be a number.' })
  @Min(1, { message: 'Coach ID must be a positive integer.' })
  coachId: number;

  @IsNumber({}, { message: 'Client ID must be a number.' })
  @Min(1, { message: 'Client ID must be a positive integer.' })
  clientId: number;

  @IsDateString({}, { message: 'Start date must be a valid date string.' })
  startDate: string;

  @IsDateString({}, { message: 'End date must be a valid date string.' })
  endDate: string;
}
