import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

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
  fitnessGoal: EFitnessGoal[];
  activityLevel: EActivityLevel;
  birthdate?: Date;
  gender?: string;
  isDeleted: boolean;
}

@Entity()
export class Client implements IClient {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.client)
  @JoinColumn()
  user: User;

  @Column()
  height: number;

  @Column()
  weight: number;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  fitnessGoal: EFitnessGoal[];

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
}
