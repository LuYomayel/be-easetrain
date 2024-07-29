// create-cycle.dto.ts
export class CreateCycleDto {
  name: string;
  coachId: number;
  startDate: Date;
  durationInMonths?: number;  // Opcional, duración del ciclo en meses
  durationInWeeks?: number;  // Opcional, duración del ciclo en semanas
  clientId: number;
}

export class AssignWorkoutsToCycleDTO {
  assignments: { workoutId: number; dayOfWeek: number }[];
}