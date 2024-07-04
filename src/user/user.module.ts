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
@Module({
  imports: [TypeOrmModule.forFeature([User, Coach, Client, ClientActivity, ClientSubscription])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
