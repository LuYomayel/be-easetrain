import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { WorkoutInstance, IWorkoutInstance } from '../../workout/entities/workout.entity';
import { ExerciseInstance, IExerciseInstance } from '../../exercise/entities/exercise.entity';

export interface IExerciseGroup {
  id: number;
  workoutInstance: IWorkoutInstance;
  exercises: IExerciseInstance[];
  set: number;
  rest: number;
  groupNumber: number;
}

@Entity()
export class ExerciseGroup implements IExerciseGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupNumber: number;

  @ManyToOne(() => WorkoutInstance, (workoutInstance) => workoutInstance.groups)
  workoutInstance: WorkoutInstance;

  @OneToMany(() => ExerciseInstance, (exercise) => exercise.group, { cascade: true, eager: true })
  exercises: ExerciseInstance[];

  @Column()
  set: number;

  @Column()
  rest: number;
}