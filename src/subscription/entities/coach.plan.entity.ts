import { Coach, ICoach } from '../../user/entities/coach.entity';
import { User } from '../../user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export interface ICoachPlan{
  id: number;
  coach: ICoach;
  name: string;
  price: number;
  workoutsPerWeek: number;
  includeMealPlan: boolean;
}
@Entity()
export class CoachPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Coach)
  coach: Coach;

  @Column()
  name: string; // e.g., "Basic Plan", "Meal + Workout Plan"

  @Column()
  price: number; // e.g., 5, 10, 20 USD

  @Column()
  workoutsPerWeek: number;

  @Column()
  includeMealPlan: boolean;
}
