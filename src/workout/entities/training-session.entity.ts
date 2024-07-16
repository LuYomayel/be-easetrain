import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { TrainingWeek } from './training-week.entity';
import { WorkoutInstance } from './workout.entity';

export interface ITrainingSession {
  id: number;
  sessionDate: Date;
  dayNumber: number;
  trainingWeek: TrainingWeek;
  workoutInstances: WorkoutInstance[];
}

@Entity()
export class TrainingSession implements ITrainingSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sessionDate: Date;

  @Column()
  dayNumber: number;

  @ManyToOne(() => TrainingWeek, trainingWeek => trainingWeek.trainingSessions)
  trainingWeek: TrainingWeek;

  @OneToMany(() => WorkoutInstance, workoutInstance => workoutInstance.trainingSession)
  workoutInstances: WorkoutInstance[];
}