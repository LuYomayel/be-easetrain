import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { FoodItem } from '../../food-item/entities/food-item.entity';

@Entity()
export class MealPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subscription, subscription => subscription.mealPlans)
  subscription: Subscription;
  
  @Column()
  dayOfWeek: string;

  @Column()
  meals: string;

  @OneToMany(() => FoodItem, (foodItem) => foodItem.mealPlan)
  foodItems: FoodItem[];
}
