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

export interface IWorkout {
  id: number;
  subscription?: Subscription;
  planName: string;
  dayOfWeek?: string;
  date?: Date;
  startTime?: string;
  endTime?: string;
  notes?: string;
  status?: string;
  groups: IExerciseGroup[];
}

// workout.entity.ts
@Entity()
export class Workout implements IWorkout {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subscription, (subscription) => subscription.workouts)
  subscription?: Subscription;

  @Column()
  dayOfWeek?: string;

  @Column()
  planName: string;

  @Column({ type: 'date', nullable: true })
  date?: Date;

  @Column({ nullable: true })
  startTime?: string;

  @Column({ nullable: true })
  endTime?: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true })
  status?: string;

  @OneToMany(() => ExerciseGroup, (exerciseGroup) => exerciseGroup.workout)
  groups: ExerciseGroup[];
}
