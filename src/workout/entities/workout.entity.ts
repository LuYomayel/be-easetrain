import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { Exercise } from 'src/exercise/entities/exercise.entity';

@Entity()
export class Workout {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subscription, (subscription) => subscription.workouts)
  subscription: Subscription;

  @Column()
  dayOfWeek: string;

  @OneToMany(() => Exercise, (exercise) => exercise.workout)
  exercises: Exercise[];
}
