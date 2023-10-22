import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Subscription } from './subscription.entity';

export enum ECoachTier {
  TIER1 = '1-3 students',
  TIER2 = '3-10 students',
  TIER3 = '10-20 students',
  TIER4 = '20+ students',
}

@Entity()
export class CoachSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Subscription)
  @JoinColumn()
  subscription: Subscription;

  @OneToOne(() => User)
  @JoinColumn()
  coach: User;

  @Column({
    type: 'enum',
    enum: ECoachTier,
  })
  tier: ECoachTier;

  get monthlyPrice(): number {
    switch (this.tier) {
      case ECoachTier.TIER1:
        return 5;
      case ECoachTier.TIER2:
        return 10;
      case ECoachTier.TIER3:
        return 20;
      case ECoachTier.TIER4:
        return 35;
      default:
        return 0;
    }
  }
}
