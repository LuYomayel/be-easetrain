import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Subscription } from '../../subscription/entities/subscription.entity';
import {
  IExerciseGroup,
  ExerciseGroup,
} from '../../exercise/entities/exercise-group.entity';
import { Coach, ICoach } from '../../user/entities/coach.entity';
import { ClientSubscription, IClientSubscription } from '../../subscription/entities/client.subscription.entity';
export interface IWorkout {
  id: number;
  clientSubscription?: IClientSubscription;
  coach: ICoach;
  planName: string;
  date?: Date;
  isRepetead:boolean;
  repeatDays: string[];
  expectedStartDate?: Date;
  expectedEndDate?: Date;
  realStartedDate?: Date;
  realEndDate?: Date;
  notes?: string;
  status?: string; // e.g., 'pending', 'completed', 'in-progress'
  dateAssigned: Date;
  dateCompleted?: Date;
  feedback?: string;
  groups: IExerciseGroup[];
}

// workout.entity.ts
@Entity()
export class Workout implements IWorkout {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ClientSubscription, (clientSubscription) => clientSubscription.workouts)
  clientSubscription?: ClientSubscription;

  @ManyToOne(() => Coach, (coach) => coach.id)
  coach: Coach;

  @Column({ default: false })
  isRepetead: boolean;

  @Column('simple-array', { nullable: true })
  repeatDays: string[]; // e.g., ['Monday', 'Wednesday', 'Friday']

  @Column()
  planName: string;

  @Column({ type: 'date', nullable: true })
  date?: Date;

  @Column({ type: 'datetime', nullable: true })
  expectedStartDate: Date;

  @Column({ type: 'datetime', nullable: true })
  expectedEndDate: Date;

  @Column({ type: 'datetime', nullable: true })
  realStartedDate: Date;

  @Column({ type: 'datetime', nullable: true })
  realEndDate: Date;

  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true })
  status?: string;

  @Column({ type: 'datetime', nullable: true })
  dateAssigned: Date;

  @Column({ type: 'datetime', nullable: true })
  dateCompleted?: Date;

  @Column({ nullable: true })
  feedback?: string;

  @OneToMany(() => ExerciseGroup, (exerciseGroup) => exerciseGroup.workout)
  groups: ExerciseGroup[];
}