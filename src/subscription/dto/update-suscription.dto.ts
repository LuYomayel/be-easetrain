// update-subscription.dto.ts

import { IsNumber, IsBoolean, IsOptional, IsDate, IsNotEmpty, isNumber, isNotEmpty } from 'class-validator';

export class UpdateSubscriptionDTO {
  @IsNumber()
  @IsNotEmpty()
  coachId:number;

  @IsNumber()
  @IsNotEmpty()
  clientId: number;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;
  
  @IsDate()
  @IsNotEmpty()
  endDate: Date;
  
  @IsDate()
  @IsNotEmpty()
  paymentDate: Date;

  @IsNumber()
  @IsNotEmpty()
  coachPlanId: number;

  @IsNumber()
  @IsOptional()
  workoutsPerWeek?: number;

  @IsBoolean()
  @IsOptional()
  includeMealPlan?: boolean;
}
