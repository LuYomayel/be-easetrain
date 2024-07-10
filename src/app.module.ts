import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { AuthModule } from './auth/auth.module';
import { EmailService } from './email/email.service';
import { JwtModule } from '@nestjs/jwt';
import { ImportModule } from './import/import.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables de entorno estén disponibles globalmente
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_DBNAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    MealPlanModule,
    SuscriptionModule,
    WorkoutModule,
    ScheduleModule,
    ReviewModule,
    PaymentModule,
    ExerciseModule,
    AuthModule,
    ImportModule
  ],
  controllers: [AppController],
  providers: [AppService, EmailService],
})
export class AppModule {}
