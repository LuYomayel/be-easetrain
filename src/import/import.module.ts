import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { Workout, WorkoutInstance } from 'src/workout/entities/workout.entity';
import { Exercise, ExerciseInstance } from 'src/exercise/entities/exercise.entity';
import { ExerciseGroup } from 'src/exercise/entities/exercise-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workout, WorkoutInstance, ExerciseGroup, ExerciseInstance, Exercise]),
  ],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}