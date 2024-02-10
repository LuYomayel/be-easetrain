import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Exercise } from './exercise.entity';
import { ExerciseBodyArea } from './exercise-body-area.entity';
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
