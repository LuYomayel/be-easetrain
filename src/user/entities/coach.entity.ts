import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ETrainingType {
  CROSS_FIT = 'cross fit',
  CALISTENICS = 'calistenics',
  GENERAL_FITNESS = 'general fitness',
}

export interface ICoach {
  id: number;
  user: User;
  name: string;
  estimatedClients: number;
  trainingType: ETrainingType[];
  hasGym: boolean;
  gymLocation: string | null;
  isDeleted: boolean;
}

@Entity()
export class Coach implements ICoach {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.coach)
  @JoinColumn()
  user: User;

  @Column()
  name: string;

  @Column()
  estimatedClients: number;

  @Column({
    type: 'simple-array',
  })
  trainingType: ETrainingType[];

  @Column({ default: false })
  hasGym: boolean;

  @Column({ nullable: true })
  gymLocation: string;

  @Column({ default: false })
  isDeleted: boolean;
}
