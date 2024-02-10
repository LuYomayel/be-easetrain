import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachSubscription } from './entities/coach.subscription.entity';
import { ClientSubscription } from './entities/client.subscription.entity';
import { Subscription } from './entities/subscription.entity';
import { UserModule } from 'src/user/user.module';
import { CoachPlan } from './entities/coach.plan.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      CoachSubscription,
      ClientSubscription,
      CoachPlan,
    ]),
    UserModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SuscriptionModule {}
