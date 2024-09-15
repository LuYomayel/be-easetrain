import { Module } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { WorkoutController } from './workout.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workout, WorkoutInstance } from './entities/workout.entity';
import { ExerciseGroup } from '../exercise/entities/exercise-group.entity';
import { Exercise, ExerciseInstance } from '../exercise/entities/exercise.entity';
import { ClientSubscription } from '../subscription/entities/client.subscription.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { User } from '../user/entities/user.entity';
import { Coach } from '../user/entities/coach.entity';
import { ClientActivity } from '../user/entities/client-activity.entity';
import { UserModule } from '../user/user.module';
import { TrainingCycle } from './entities/training-cycle.entity';
import { TrainingSession } from './entities/training-session.entity';
import { ExerciseSetLog } from '../exercise/entities/exercise-set-log.entity';
import OpenAI from 'openai';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workout,
      WorkoutInstance,
      Exercise,
      ExerciseGroup,
      ExerciseInstance,
      Subscription,
      ClientSubscription,
      User,
      Coach,
      ClientActivity,
      TrainingCycle,
      TrainingSession,
      ExerciseSetLog
    ]),
    UserModule
  ],
  controllers: [WorkoutController],
  providers: [WorkoutService, OpenAI],
})
export class WorkoutModule {}
