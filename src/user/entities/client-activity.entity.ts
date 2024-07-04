import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

export interface IClientActivity{
    id: number;
    user: User;
    description: string;
    timestamp: Date;
}
@Entity()
export class ClientActivity implements IClientActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.activities)
  user: User;

  @Column()
  description: string;

  @CreateDateColumn()
  timestamp: Date;
}