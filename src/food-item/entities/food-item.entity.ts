import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MealPlan } from '../../meal-plan/entities/meal-plan.entity';

@Entity()
export class FoodItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  calories: number;

  @ManyToOne(() => MealPlan, (mealPlan) => mealPlan.foodItems)
  mealPlan: MealPlan;
}
