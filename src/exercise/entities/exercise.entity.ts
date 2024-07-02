import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { IExerciseGroup, ExerciseGroup } from './exercise-group.entity';
import { BodyArea, IBodyArea } from './body-area.entity';
import { ExerciseBodyArea } from './exercise-body-area.entity';
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
  group: IExerciseGroup;
  repetitions?: string;
  sets?: string;
  time?: string;
  weight?: string;
  restInterval?: string;
  tempo?: string;
  notes?: string;
  difficulty?: string;
  duration?: string;
  distance?: string;
}

@Entity()
export class ExerciseInstance implements IExerciseInstance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.exerciseInstances)
  exercise: Exercise;

  @Column({ nullable: true })
  repetitions?: string;

  @Column({ nullable: true })
  sets?: string;

  @Column({ nullable: true })
  time?: string;

  @Column({ nullable: true })
  weight?: string;

  @Column({ nullable: true })
  restInterval?: string;

  @Column({ nullable: true })
  tempo?: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true })
  difficulty?: string;

  @Column({ nullable: true })
  duration?: string;

  @Column({ nullable: true })
  distance?: string;

  @ManyToOne(() => ExerciseGroup, (group) => group.exercises)
  group: ExerciseGroup;
}
