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

  @Column({ nullable: true })
  multimedia: string;

  @Column({ nullable: true })
  exerciseType: string;

  @Column({ nullable: true })
  equipmentNeeded: string;

  @Column({ nullable: true })
  isDeleted: boolean;
}

export interface IExerciseInstance {
  id: number;
  exercise: IExercise;
  workout: Workout;
  repetitions?: number;
  sets?: number;
  time?: number;
  weight?: number;
  restInterval?: number;
  tempo?: string;
  notes?: string;
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
  time?: number;

  @Column({ nullable: true })
  weight?: number;

  @Column({ nullable: true })
  restInterval?: number;

  @Column({ nullable: true })
  tempo?: string;

  @Column({ nullable: true })
  notes?: string;
}
