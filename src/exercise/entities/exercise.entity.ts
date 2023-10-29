import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Workout } from '../../workout/entities/workout.entity';

// exercise.interface.ts
export interface IExercise {
  id: number;
  name: string;
  description?: string;
  multimedia?: string;
  exerciseType?: string;
  equipmentNeeded?: string;
}

// exerciseInstance.interface.ts
export interface IExerciseInstance {
  id: number;
  exercise: IExercise;
  repetitions?: number;
  sets?: number;
  time?: number;
  weight?: number;
  restInterval?: number;
  tempo?: string;
  notes?: string;
}

@Entity()
export class Exercise implements IExercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(
    () => ExerciseInstance,
    (exerciseInstance) => exerciseInstance.exercise,
  )
  exerciseInstances: ExerciseInstance[];
}

@Entity()
export class ExerciseInstance implements IExerciseInstance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.exerciseInstances)
  exercise: Exercise;

  @ManyToOne(() => Workout, (workout) => workout.exercises)
  workout: Workout;

  @Column({ nullable: true })
  repetitions?: number;

  @Column({ nullable: true })
  sets?: number;

  @Column({ nullable: true })
  duration?: string;

  @Column({ nullable: true })
  weight?: number;
}
