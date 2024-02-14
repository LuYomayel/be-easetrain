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
import { Coach } from 'src/user/entities/coach.entity';
import {
  IExerciseInstance,
  ExerciseInstance,
} from 'src/exercise/entities/exercise.entity';

export interface IWorkout {
  id: number;
  subscription?: Subscription;
  coach: Coach;
  planName: string;
  dayOfWeek?: string;
  date?: Date;
  startTime?: string;
  endTime?: string;
  notes?: string;
  status?: string;
  groups: IExerciseGroup[];
  exercises: IExerciseInstance[];
}

// workout.entity.ts
@Entity()
export class Workout implements IWorkout {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subscription, (subscription) => subscription.workouts)
  subscription?: Subscription;

  @ManyToOne(() => Coach, (coach) => coach.id)
  coach: Coach;

  @Column({ nullable: true })
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

  @OneToMany(
    () => ExerciseInstance,
    (exerciseInstance) => exerciseInstance.workout,
  )
  exercises: ExerciseInstance[];
}
