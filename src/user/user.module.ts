// user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Coach } from './entities/coach.entity';
import { Client } from './entities/client.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, Coach, Client])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
