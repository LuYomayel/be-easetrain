import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Workout } from '../../workout/entities/workout.entity';

@Entity()
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  repetitions: number;

  @Column()
  sets: number;

  @ManyToOne(() => Workout, (workout) => workout.exercises)
  workout: Workout;
}
