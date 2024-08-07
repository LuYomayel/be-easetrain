import { Module } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { WorkoutController } from './workout.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workout } from './entities/workout.entity';
import { ExerciseGroup } from '../exercise/entities/exercise-group.entity';
import { Exercise, ExerciseInstance } from '../exercise/entities/exercise.entity';
import { ClientSubscription } from '../subscription/entities/client.subscription.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { User } from '../user/entities/user.entity';
import { Coach } from 'src/user/entities/coach.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workout,
      Exercise,
      ExerciseGroup,
      ExerciseInstance,
      Subscription,
      ClientSubscription,
      User,
      Coach,
    ]),
  ],
  controllers: [WorkoutController],
  providers: [WorkoutService],
})
export class WorkoutModule {}
