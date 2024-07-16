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
import { Coach } from 'src/user/entities/coach.entity';
import { ClientActivity } from '../user/entities/client-activity.entity';
import { UserModule } from 'src/user/user.module';
import { TrainingCycle } from './entities/training-cycle.entity';
import { TrainingSession } from './entities/training-session.entity';
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
      TrainingSession
    ]),
    UserModule
  ],
  controllers: [WorkoutController],
  providers: [WorkoutService],
})
export class WorkoutModule {}
