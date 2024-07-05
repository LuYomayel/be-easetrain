import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Subscription } from './subscription.entity';
import { SubscriptionPlan } from './subscription.plan.entity';
@Entity()
export class CoachSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Subscription)
  @JoinColumn()
  subscription: Subscription;

  @OneToOne(() => User)
  @JoinColumn()
  coach: User;

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn()
  subscriptionPlan: SubscriptionPlan;
}
