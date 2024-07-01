import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { MealPlanModule } from './meal-plan/meal-plan.module';
import { SuscriptionModule } from './subscription/subscription.module';
import { WorkoutModule } from './workout/workout.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ReviewModule } from './review/review.module';
import { PaymentModule } from './payment/payment.module';
import { ExerciseModule } from './exercise/exercise.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'trainease',
      password: 'Pipi2612',
      database: 'coaching',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    }),
    UserModule,
    MealPlanModule,
    SuscriptionModule,
    WorkoutModule,
    ScheduleModule,
    ReviewModule,
    PaymentModule,
    ExerciseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
