import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Subscription } from '../../subscription/entities/subscription.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column()
  date: Date;

  @ManyToOne(() => Subscription, (subscription) => subscription.payments)
  subscription: Subscription;
}
