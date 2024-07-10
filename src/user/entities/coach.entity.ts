import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Client, IClient } from './client.entity';
import { Exercise, IExercise } from 'src/exercise/entities/exercise.entity';

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
  bio: string;
  experience: string;
  clients: IClient[];
  exercises: IExercise[]
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
  bio: string;
  
  @Column()
  experience: string;

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

  @OneToMany(() => Client, client => client.coach)
  clients: Client[];

  @OneToMany(() => Exercise, exercise => exercise.coach)
  exercises: Exercise[]
}
