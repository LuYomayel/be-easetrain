import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ISubscription, Subscription } from './subscription.entity';
import { CoachPlan, ICoachPlan } from './coach.plan.entity';
import { Client, IClient } from 'src/user/entities/client.entity';
import { IWorkout, Workout } from '../../workout/entities/workout.entity';

export interface IClientSubscription{
  id: number;
  subscription: ISubscription;
  client: IClient;
  coachPlan: ICoachPlan;
  workouts: IWorkout[];
}

@Entity()
export class ClientSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Subscription)
  @JoinColumn()
  subscription: Subscription;

  @OneToOne(() => Client)
  @JoinColumn()
  client: Client;

  @ManyToOne(() => CoachPlan)
  coachPlan: CoachPlan;

  @OneToMany(() => Workout, (workout) => workout.clientSubscription)
  workouts: Workout[];
}