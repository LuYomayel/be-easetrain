import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { ExerciseInstance } from 'src/exercise/entities/exercise.entity';

export interface IWorkout {
  id: number;
  subscription: Subscription;
  dayOfWeek: string;
  date?: Date;
  startTime?: string;
  endTime?: string;
  notes?: string;
  status?: string;
  exercises: ExerciseInstance[];
}

// workout.entity.ts
@Entity()
export class Workout implements IWorkout {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subscription, (subscription) => subscription.workouts)
  subscription: Subscription;

  @Column()
  dayOfWeek: string;

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

  @OneToMany(
    () => ExerciseInstance,
    (exerciseInstance) => exerciseInstance.workout,
  )
  exercises: ExerciseInstance[];
}
