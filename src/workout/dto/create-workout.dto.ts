import { IExerciseGroup } from 'src/exercise/entities/exercise-group.entity';

export class CreateWorkoutDto {
  planName: string;
  dayOfWeek?: string;
  date?: Date;
  groups: IExerciseGroup[];
}
