import { Type } from 'class-transformer';
import { IsNumber, IsBoolean, IsOptional, IsDate, Min } from 'class-validator';

export class UpdateSubscriptionDTO {
  @IsNumber({}, { message: 'Coach ID must be a number.' })
  @Min(1, { message: 'Coach ID must be a positive integer.' })
  coachId: number;

  @IsNumber({}, { message: 'Client ID must be a number.' })
  @Min(1, { message: 'Client ID must be a positive integer.' })
  clientId: number;

  @Type(() => Date)
  @IsDate({ message: 'Start date must be a valid date.' })
  startDate: Date;

  @Type(() => Date)
  @IsDate({ message: 'End date must be a valid date.' })
  endDate: Date;

  @Type(() => Date)
  @IsDate({ message: 'Payment date must be a valid date.' })
  paymentDate: Date;

  @IsNumber({}, { message: 'Coach plan ID must be a number.' })
  @Min(1, { message: 'Coach plan ID must be a positive integer.' })
  coachPlanId: number;

  @IsOptional()
  @IsNumber({}, { message: 'Workouts per week must be a number.' })
  @Min(1, { message: 'Workouts per week must be at least 1.' })
  workoutsPerWeek?: number;

  @IsOptional()
  @IsBoolean({ message: 'Include meal plan must be a boolean value.' })
  includeMealPlan?: boolean;
}