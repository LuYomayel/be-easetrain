import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Workout } from '../../workout/entities/workout.entity';
import { BodyArea, ExerciseBodyArea, IBodyArea } from './body-area.entity';
// exercise.interface.ts
export interface IExercise {
  id: number;
  name: string;
  description?: string;
  multimedia?: string;
  exerciseType?: string;
  equipmentNeeded?: string;
  isDeleted?: boolean;
  bodyAreas?: IBodyArea[];
  exerciseBodyAreas?: ExerciseBodyArea;
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

  @ManyToMany(() => BodyArea, (bodyArea) => bodyArea.exercises)
  bodyAreas: BodyArea[];

  @OneToMany(
    () => ExerciseBodyArea,
    (exerciseBodyArea) => exerciseBodyArea.exercise,
  )
  exerciseBodyAreas: ExerciseBodyArea;
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
  difuculty?: string;
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

  @Column({ nullable: true })
  difuculty?: string;
}
