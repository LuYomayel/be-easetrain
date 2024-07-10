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
import { ClientSubscription, IClientSubscription } from './client.subscription.entity';
import { CoachSubscription, ICoachSubscription } from './coach.subscription.entity';

export enum EStatus{
  ACTIVE= "Active",
  INACTIVE="Inactive",
  EXPIRED = "Expired"
}
export interface ISubscription {
  id: number;
  user: User;
  mealPlans?: MealPlan[];
  schedules?: Schedule[];
  startDate?: Date;
  endDate?: Date;
  status: EStatus;
  lastPaymentDate?: Date,
  nextPaymentDate?: Date,
  payments?: Payment[];
  isDeleted: boolean;
  coachSubscription? : ICoachSubscription;
  clientSubscription? : IClientSubscription;
}

@Entity()
export class Subscription implements ISubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.subscription)
  @JoinColumn()
  user: User;

  @OneToMany(() => MealPlan, (mealPlan) => mealPlan.subscription)
  mealPlans?: MealPlan[];

  @OneToMany(() => Schedule, (schedule) => schedule.subscription)
  schedules?: Schedule[];

  @OneToMany(() => Payment, (payment) => payment.subscription)
  payments?: Payment[];

  @Column({ default: false })
  isDeleted: boolean;

  @OneToOne( () => CoachSubscription, (coachSubscription) => coachSubscription.subscription)
  coachSubscription?: CoachSubscription;

  @OneToOne( () => ClientSubscription, (clientSubscription) => clientSubscription.subscription)
  clientSubscription?: ClientSubscription;

  @Column({nullable:true})
  startDate?: Date;

  @Column({nullable:true})
  lastPaymentDate?: Date;
  
  @Column({nullable:true})
  nextPaymentDate?: Date;

  @Column({nullable:true})
  endDate?: Date;

  @Column()
  status: EStatus;
}