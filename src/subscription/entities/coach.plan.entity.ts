import { User } from '../../user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CoachPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  coach: User;

  @Column()
  name: string; // e.g., "Basic Plan", "Meal + Workout Plan"

  @Column()
  price: number; // e.g., 5, 10, 20 USD

  @Column()
  workoutsPerWeek: number;

  @Column()
  includeMealPlan: boolean;
}
