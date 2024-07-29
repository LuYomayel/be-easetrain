import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import {
  IExerciseGroup,
  ExerciseGroup,
} from '../../exercise/entities/exercise-group.entity';
import { Coach, ICoach } from '../../user/entities/coach.entity';
import { ClientSubscription, IClientSubscription } from '../../subscription/entities/client.subscription.entity';
import { ITrainingSession, TrainingSession } from './training-session.entity';
import { ExerciseSetLog } from '../../exercise/entities/exercise-set-log.entity';
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
  instanceName: string;
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
  sessionTime: Date;
  generalFeedback: string;
  energyLevel: number;
  mood: number;
  perceivedDifficulty: number;
  additionalNotes: string;
  trainingSession?: ITrainingSession;
  setLogs?: ExerciseSetLog[];
}

// Entidad WorkoutInstance que es específica para cada cliente
@Entity()
export class WorkoutInstance implements IWorkoutInstance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Workout, (workout) => workout.workoutInstances, { eager: true })
  workout: Workout;

  @ManyToOne(() => ClientSubscription, (clientSubscription) => clientSubscription.workoutInstances, { eager: true })
  clientSubscription: ClientSubscription;

  @Column({ nullable: true })
  instanceName: string;
  
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

  @OneToMany(() => ExerciseGroup, (group) => group.workoutInstance, { cascade: true, eager: true })
  groups: ExerciseGroup[];

  @Column({ type: 'time', nullable: true })
  sessionTime: Date;

  @Column({ nullable: true })
  generalFeedback: string;

  @Column({ nullable: true })
  energyLevel: number;

  @Column({ nullable: true })
  mood: number;

  @Column({ nullable: true })
  perceivedDifficulty: number;

  @Column({ nullable: true })
  additionalNotes: string;

  @ManyToOne(() => TrainingSession, trainingSession => trainingSession.workoutInstances)
  trainingSession: TrainingSession; // Ejemplo: "Entrenamiento del Lunes de la Semana 1 de Julio"

  @OneToMany(() => ExerciseSetLog, setLog => setLog.workoutInstance)
  setLogs: ExerciseSetLog[];
}