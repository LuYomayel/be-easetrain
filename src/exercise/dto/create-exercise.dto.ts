export class CreateExerciseDto {
  name: string;
  description: string;
  multimedia: string;
  exerciseType: string;
  equipmentNeeded: string;
  bodyArea: number[];
  coachId:number;
}
