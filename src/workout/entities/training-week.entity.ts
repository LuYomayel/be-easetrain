import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { TrainingCycle } from './training-cycle.entity';
import { TrainingSession } from './training-session.entity';

export interface ITrainingWeek {
  id: number;
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  trainingCycle: TrainingCycle;
  trainingSessions: TrainingSession[];
}

@Entity()
export class TrainingWeek implements ITrainingWeek {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  weekNumber: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => TrainingCycle, trainingCycle => trainingCycle.trainingWeeks)
  trainingCycle: TrainingCycle;

  @OneToMany(() => TrainingSession, trainingSession => trainingSession.trainingWeek)
  trainingSessions: TrainingSession[];
}