import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IWorkoutInstance, WorkoutInstance } from '../../workout/entities/workout.entity';
import { ExerciseInstance } from './exercise.entity';

export interface IExerciseSetLog {
    id: number;
    workoutInstance: IWorkoutInstance;
    exerciseId: number;
    setNumber: number;
    repetitions?: string;
    weight?: string;
    time?: string;
    distance?: string;
    tempo?: string;
    notes?: string;
    difficulty?: string;
    duration?: string;
    restInterval?: string;
}

@Entity()
export class ExerciseSetLog implements IExerciseSetLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WorkoutInstance, workoutInstance => workoutInstance.setLogs)
  workoutInstance: WorkoutInstance;

  @ManyToOne(() => ExerciseInstance, exerciseInstance => exerciseInstance.setLogs)
  exerciseInstance: ExerciseInstance;
  
  @Column()
  exerciseId: number;

  @Column()
  setNumber: number;

  @Column({ nullable: true })
  repetitions: string;

  @Column({ nullable: true })
  weight: string;

  @Column({ nullable: true })
  time: string;

  @Column({ nullable: true })
  distance: string;

  @Column({ nullable: true })
  tempo: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  difficulty: string;

  @Column({ nullable: true })
  duration: string;

  @Column({ nullable: true })
  restInterval: string;
}