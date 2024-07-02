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
import { IWorkoutInstance, WorkoutInstance } from '../../workout/entities/workout.entity';

export interface IClientSubscription{
  id: number;
  subscription: ISubscription;
  client: IClient;
  coachPlan: ICoachPlan;
  workoutInstances: IWorkoutInstance[];
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

  @OneToMany(() => WorkoutInstance, (workoutInstance) => workoutInstance.clientSubscription)
  workoutInstances: WorkoutInstance[];
}