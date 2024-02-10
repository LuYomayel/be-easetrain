import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Subscription } from '../../subscription/entities/subscription.entity';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dayOfWeek: string;

  @Column()
  time: string;

  @ManyToOne(() => Subscription, (subscription) => subscription.schedules)
  subscription: Subscription;
}
