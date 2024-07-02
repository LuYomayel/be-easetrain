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
  coach: ICoach;
  planName: string;
  workoutInstances: IWorkoutInstance[];
}

// Entidad Workout que actúa como plantilla
@Entity()
export class Workout implements IWorkout {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Coach, (coach) => coach.id)
  coach: Coach;

  @Column()
  planName: string;

  @OneToMany(() => WorkoutInstance, (workoutInstance) => workoutInstance.workout)
  workoutInstances: WorkoutInstance[];
}

export interface IWorkoutInstance {
  id: number;
  workout: IWorkout;
  clientSubscription?: IClientSubscription;
  personalizedNotes?: string;
  status?: string;
  dateAssigned: Date;
  dateCompleted?: Date;
  feedback?: string;
  isRepeated: boolean;
  isTemplate: boolean;
  repeatDays: string[];
  expectedStartDate?: Date;
  expectedEndDate?: Date;
  realStartedDate?: Date;
  realEndDate?: Date;
  groups: IExerciseGroup[];
}

// Entidad WorkoutInstance que es específica para cada cliente
@Entity()
export class WorkoutInstance implements IWorkoutInstance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Workout, (workout) => workout.workoutInstances)
  workout: Workout;

  @ManyToOne(() => ClientSubscription, (clientSubscription) => clientSubscription.workoutInstances)
  clientSubscription: ClientSubscription;

  @Column({ nullable: true })
  personalizedNotes?: string;

  @Column({ nullable: true })
  status?: string;

  @Column({ type: 'datetime', nullable: true })
  dateAssigned: Date;

  @Column({ type: 'datetime', nullable: true })
  dateCompleted?: Date;

  @Column({ nullable: true })
  feedback?: string;

  @Column({ default: false })
  isRepeated: boolean;

  @Column({ default: false })
  isTemplate: boolean;

  @Column('simple-array', { nullable: true })
  repeatDays: string[]; // e.g., ['Monday', 'Wednesday', 'Friday']

  @Column({ type: 'datetime', nullable: true })
  expectedStartDate: Date;

  @Column({ type: 'datetime', nullable: true })
  expectedEndDate: Date;

  @Column({ type: 'datetime', nullable: true })
  realStartedDate: Date;

  @Column({ type: 'datetime', nullable: true })
  realEndDate: Date;

  @OneToMany(() => ExerciseGroup, (exerciseGroup) => exerciseGroup.workoutInstance)
  groups: ExerciseGroup[];
}