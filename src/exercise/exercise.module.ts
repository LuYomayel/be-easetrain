import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { Exercise } from './entities/exercise.entity';
import { BodyArea } from './entities/body-area.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([BodyArea, Exercise])],
  controllers: [ExerciseController],
  providers: [ExerciseService],
})
export class ExerciseModule {}
