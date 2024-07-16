// create-cycle.dto.ts
export class CreateCycleDto {
  name: string;
  coachId: number;
  startDate: Date;
  endDate?: Date;
  isMonthly: boolean;
  clientId: number;
}

export class AssignWorkoutsToCycleDTO {
  assignments: { workoutId: number; dayOfWeek: number }[];
}