// ClientSubscription.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Subscription } from './subscription.entity';
import { CoachPlan } from './coach.plan.entity';

@Entity()
export class ClientSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Subscription)
  @JoinColumn()
  subscription: Subscription;

  @OneToOne(() => User)
  @JoinColumn()
  client: User;

  @ManyToOne(() => CoachPlan)
  coachPlan: CoachPlan;
}
