import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Coach } from '../../user/entities/coach.entity';
import { TrainingWeek } from './training-week.entity';
import { Client, IClient } from '../../user/entities/client.entity';

export interface ITrainingCycle {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  coach: Coach;
  trainingWeeks: TrainingWeek[];
  client: IClient; 
}

@Entity()
export class TrainingCycle implements ITrainingCycle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => Coach, coach => coach.trainingCycles)
  coach: Coach;

  @ManyToOne(() => Client, client => client.trainingCycles)
  client: Client; 

  @OneToMany(() => TrainingWeek, trainingWeek => trainingWeek.trainingCycle, {eager: true})
  trainingWeeks: TrainingWeek[];
}