// update-subscription.dto.ts

import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateSubscriptionDTO {
  @IsNumber()
  @IsOptional()
  workoutsPerWeek?: number;

  @IsBoolean()
  @IsOptional()
  includeMealPlan?: boolean;
}
