import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { MealPlan } from '../../meal-plan/entities/meal-plan.entity';
import { Schedule } from '../../schedule/entities/schedule.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { User } from '../../user/entities/user.entity';

export interface ISubscription {
  id: number;
  user: User;
  mealPlans: MealPlan[];
  schedules: Schedule[];
  payments: Payment[];
  isDeleted: boolean;
}

@Entity()
export class Subscription implements ISubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.subscription)
  @JoinColumn()
  user: User;

  @OneToMany(() => MealPlan, (mealPlan) => mealPlan.subscription)
  mealPlans: MealPlan[];

  @OneToMany(() => Schedule, (schedule) => schedule.subscription)
  schedules: Schedule[];

  @OneToMany(() => Payment, (payment) => payment.subscription)
  payments: Payment[];

  @Column({ default: false })
  isDeleted: boolean;
}