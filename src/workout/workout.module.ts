import { Module } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { WorkoutController } from './workout.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workout } from './entities/workout.entity';
import { ExerciseGroup } from '../exercise/entities/exercise-group.entity';
import { ExerciseInstance } from '../exercise/entities/exercise.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Workout, ExerciseGroup, ExerciseInstance]),
  ],
  controllers: [WorkoutController],
  providers: [WorkoutService],
})
export class WorkoutModule {}
