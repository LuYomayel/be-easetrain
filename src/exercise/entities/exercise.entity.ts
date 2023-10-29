import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Workout } from '../../workout/entities/workout.entity';

@Entity()
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  repetitions: number;

  @Column({ nullable: true })
  sets: number;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  weight: number;

  @Column({ nullable: true })
  distance: number;

  @Column({ nullable: true })
  intensity: string;

  @Column({ nullable: true })
  equipment: string;

  @Column({ nullable: true })
  difficulty: string;

  @Column({ nullable: true, type: 'text' })
  instructions: string;

  @Column({ nullable: true })
  multimedia: string;

  @Column({ nullable: true })
  rest: number;

  @Column({ nullable: true })
  order: number;

  @Column({ nullable: true })
  unitOfMeasure: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @ManyToOne(() => Workout, (workout) => workout.exercises)
  workout: Workout;
}
