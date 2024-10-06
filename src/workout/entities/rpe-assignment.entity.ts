// src/entities/rpe-assignment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { RpeMethod } from './rpe-method.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class RpeAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RpeMethod, (rpeMethod) => rpeMethod.id)
  rpeMethod: RpeMethod;

  @Column()
  targetType: string;  // Can be 'workout', 'user', or 'plan'

  @Column()
  targetId: number;  // Can refer to a workout ID, user ID, or plan ID

  @ManyToOne(() => User, (user) => user.rpeAssignments)
  assignedBy: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;
}