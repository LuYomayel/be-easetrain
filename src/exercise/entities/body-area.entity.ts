import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Exercise } from './exercise.entity';

export interface IBodyArea {
  id: number;
  name: string;
  exercises: Exercise[];
  exerciseBodyAreas: ExerciseBodyArea;
}

@Entity()
export class BodyArea implements IBodyArea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Exercise, (exercise) => exercise.bodyAreas)
  exercises: Exercise[];

  @OneToMany(
    () => ExerciseBodyArea,
    (exerciseBodyArea) => exerciseBodyArea.bodyArea,
  )
  exerciseBodyAreas: ExerciseBodyArea;
}

export interface IExerciseBodyArea {
  id: number;
  exercise: Exercise;
  bodyArea: BodyArea;
}

@Entity()
export class ExerciseBodyArea implements IExerciseBodyArea {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.exerciseBodyAreas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'exerciseId' })
  exercise: Exercise;

  @ManyToOne(() => BodyArea, (bodyArea) => bodyArea.exerciseBodyAreas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bodyAreaId' })
  bodyArea: BodyArea;
}
