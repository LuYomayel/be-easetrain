// user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Coach } from './entities/coach.entity';
import { Client } from './entities/client.entity';
import { ClientActivity } from './entities/client-activity.entity';
import { ClientSubscription } from '../subscription/entities/client.subscription.entity';
import { CoachSubscription } from 'src/subscription/entities/coach.subscription.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { CoachPlan } from 'src/subscription/entities/coach.plan.entity';
import { EmailService } from '../email/email.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      Coach, 
      Client, 
      ClientActivity, 
      ClientSubscription, 
      CoachSubscription, 
      Subscription, 
      CoachPlan
    ]), 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_PWD'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [UserService, EmailService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
