import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { Workout, WorkoutInstance } from '../workout/entities/workout.entity';
import { Exercise, ExerciseInstance } from '../exercise/entities/exercise.entity';
import { ExerciseGroup } from '../exercise/entities/exercise-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workout, WorkoutInstance, ExerciseGroup, ExerciseInstance, Exercise]),
  ],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}