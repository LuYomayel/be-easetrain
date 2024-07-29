import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ISubscription, Subscription } from './subscription.entity';
import { ISubcriptionPlan, SubscriptionPlan } from './subscription.plan.entity';
import { Coach } from '../../user/entities/coach.entity';

export interface ICoachSubscription{
  id:number;
  subscription: ISubscription;
  coach: Coach;
  subscriptionPlan: ISubcriptionPlan;
}
@Entity()
export class CoachSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Subscription)
  @JoinColumn()
  subscription: Subscription;

  @OneToOne(() => Coach)
  @JoinColumn()
  coach: Coach;

  @ManyToOne(() => SubscriptionPlan, subscriptionPlan => subscriptionPlan.coachSubscriptions)
  subscriptionPlan: SubscriptionPlan;
}
