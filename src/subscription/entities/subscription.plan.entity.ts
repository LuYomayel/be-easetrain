import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export interface ISubcriptionPlan{
    id:number;
    name:string;
    max_clients:number;
    price:number;
}
@Entity()
export class SubscriptionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  max_clients: number;

  @Column()
  price: number;
}