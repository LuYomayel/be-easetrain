// src/entities/rpe-method.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class RpeMethod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;  // Nombre de la escala (e.g., "Escala de Borg", "RIR")

  @Column()
  minValue: number;  // Valor mínimo de la escala

  @Column()
  maxValue: number;  // Valor máximo de la escala

  @Column({ type: 'float', default: 1 })
  step: number;  // Incremento en cada paso de la escala (e.g., 0.5, 1, etc.)

  @Column({ type: 'jsonb', nullable: true })
  valuesMeta?: Array<{ value: number; color: string; emoji?: string }>;  // Información extra para cada valor

  @ManyToOne(() => User, (user) => user.rpeMethods)
  createdBy: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}