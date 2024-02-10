import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exercise } from './exercise.entity';
import { BodyArea } from './body-area.entity';
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
