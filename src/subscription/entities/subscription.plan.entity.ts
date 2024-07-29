import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CoachSubscription, ICoachSubscription } from './coach.subscription.entity';
export interface ISubcriptionPlan{
    id:number;
    name:string;
    max_clients:number;
    price:number;
    coachSubscriptions?: ICoachSubscription[];
}
@Entity()
export class SubscriptionPlan implements ISubcriptionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  max_clients: number;

  @Column()
  price: number;

  @OneToMany(() => CoachSubscription, coachSubscription => coachSubscription.subscriptionPlan)
  coachSubscriptions?: CoachSubscription[];
}