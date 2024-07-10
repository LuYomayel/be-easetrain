import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { Exercise } from './entities/exercise.entity';
import { BodyArea } from './entities/body-area.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseBodyArea } from './entities/exercise-body-area.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([BodyArea, Exercise, ExerciseBodyArea]), UserModule],
  controllers: [ExerciseController],
  providers: [ExerciseService],
})
export class ExerciseModule {}
