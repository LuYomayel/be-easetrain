import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Coach, ICoach } from './coach.entity';
import { ClientSubscription, IClientSubscription } from 'src/subscription/entities/client.subscription.entity';

export enum EFitnessGoal {
  WEIGHT_LOSS = 'weight loss',
  MUSCLE_GAIN = 'muscle gain',
  MAINTENANCE = 'maintenance',
  GAIN_MOBILITY = 'gain mobility',
  FLEXIBILITY = 'flexibility',
}

export enum EActivityLevel {
  SEDENTARY = 'sedentary',
  MODERATELY_ACTIVE = 'moderately active',
  VERY_ACTIVE = 'very active',
}

export interface IClient {
  id: number;
  user: User;
  height: number;
  weight: number;
  fitnessGoal: string;
  activityLevel: EActivityLevel;
  birthdate?: Date;
  phoneNumber?: number;
  gender?: string;
  isDeleted: boolean;
  name: string;
  coach: ICoach;
}

@Entity()
export class Client implements IClient {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.client)
  @JoinColumn()
  user: User;

  @Column()
  name: string;

  @Column()
  height: number;

  @Column()
  weight: number;

  @Column()
  phoneNumber?: number;

  @Column({
    // type: 'simple-array',
    nullable: true,
  })
  fitnessGoal: string;

  @Column({
    type: 'enum',
    enum: EActivityLevel,
    nullable: true,
  })
  activityLevel: EActivityLevel;

  @Column({ nullable: true })
  birthdate: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToOne(() => Coach, (coach) => coach.clients)  // Relación Many-to-One
  coach: Coach;
}
