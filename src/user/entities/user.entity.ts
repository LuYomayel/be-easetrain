import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Review } from '../../review/entities/review.entity';
import { Coach } from '../entities/coach.entity';
import { Client } from '../entities/client.entity';
import { ClientSubscription } from '../../subscription/entities/client.subscription.entity';
import { CoachSubscription } from '../../subscription/entities/coach.subscription.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';

export enum EUserType {
  COACH = 'coach',
  CLIENT = 'client',
}

export interface IUser {
  id: number;
  email: string;
  password: string;
  userType: EUserType;
  coach: Coach;
  client: Client;
  reviews: Review[];
  isDeleted: boolean;
  clientSubscriptions: ClientSubscription[];
  coachSubscriptions: CoachSubscription[];
  subscription: Subscription;
}

@Entity()
export class User implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: EUserType,
  })
  userType: EUserType;

  @OneToOne(() => Coach, (coach) => coach.user)
  coach: Coach;

  @OneToOne(() => Client, (client) => client.user)
  client: Client;

  @OneToMany(() => Review, (review) => review.coach)
  reviews: Review[];

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(
    () => ClientSubscription,
    (clientSubscription) => clientSubscription.client,
  )
  clientSubscriptions: ClientSubscription[];

  @OneToMany(
    () => CoachSubscription,
    (coachSubscription) => coachSubscription.coach,
  )
  coachSubscriptions: CoachSubscription[];

  @OneToOne(() => Subscription, (subscription) => subscription.user)
  subscription: Subscription;
}
