// exercise-group.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Workout } from '../../workout/entities/workout.entity';
import { ExerciseInstance } from '../../exercise/entities/exercise.entity';

export interface IExerciseGroup {
  id: number;
  workout: Workout;
  exercises: ExerciseInstance[];
  set: number;
  rest: number;
}

@Entity()
export class ExerciseGroup implements IExerciseGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Workout, (workout) => workout.groups)
  workout: Workout;

  @OneToMany(
    () => ExerciseInstance,
    (exerciseInstance) => exerciseInstance.group,
  )
  exercises: ExerciseInstance[];

  @Column()
  set: number;

  @Column()
  rest: number;
  // Agrega aquí otras propiedades específicas del grupo si las hay
}
