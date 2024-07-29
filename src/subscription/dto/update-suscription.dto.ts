import { Type } from 'class-transformer';
import { IsNumber, IsBoolean, IsOptional, IsDate, IsNotEmpty } from 'class-validator';

export class UpdateSubscriptionDTO {
  @IsNumber()
  @IsNotEmpty()
  coachId: number;

  @IsNumber()
  @IsNotEmpty()
  clientId: number;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endDate: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
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