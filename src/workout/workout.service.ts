import { Injectable } from '@nestjs/common';
import { AssignWorkoutDto, CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Workout } from './entities/workout.entity';
import { DataSource } from 'typeorm';
import { ExerciseGroup } from '../exercise/entities/exercise-group.entity';
import { ExerciseInstance } from '../exercise/entities/exercise.entity';
import { ClientSubscription } from '../subscription/entities/client.subscription.entity';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { User } from 'src/user/entities/user.entity';
@Injectable()
export class WorkoutService {
  constructor(
    @InjectRepository(Workout)
    private workoutRepository: Repository<Workout>,
    private dataSource: DataSource,
    @InjectRepository(ExerciseGroup)
    private exerciseGroupRepository: Repository<ExerciseGroup>,
    @InjectRepository(ExerciseInstance)
    private exerciseInstanceRepository: Repository<ExerciseInstance>,
    @InjectRepository(ClientSubscription)
    private clientSubscriptionRepository: Repository<ClientSubscription>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createWorkoutDto: CreateWorkoutDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const workout = queryRunner.manager.create(Workout, createWorkoutDto);
      const savedWorkout = await queryRunner.manager.save(workout);
      for (const groupDto of createWorkoutDto.groups) {
        const exerciseGroup = queryRunner.manager.create(ExerciseGroup, {
          ...groupDto,
          exercises: groupDto.exercises.map((exerciseDto) =>
            queryRunner.manager.create(ExerciseInstance, {
              ...exerciseDto,
              exercise: exerciseDto.exercise,
            }),
          ),
          workout: savedWorkout,
        });
        const savedGroup = await queryRunner.manager.save(exerciseGroup);
        console.log('savedGroup', savedGroup);
        for (const exerciseDto of groupDto.exercises) {
          const exerciseInstance = queryRunner.manager.create(
            ExerciseInstance,
            {
              ...exerciseDto,
              group: savedGroup,
              exercise: exerciseDto.exercise,
            },
          );
          console.log('exerciseInstance', exerciseInstance);
          await queryRunner.manager.save(exerciseInstance);
        }
      }

      await queryRunner.commitTransaction();
      return savedWorkout;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all workout`;
  }

  async assignWorkout(assignWorkoutDto: AssignWorkoutDto) {
    try {
      const workout = await this.workoutRepository.findOneBy({
        id: assignWorkoutDto.workoutId,
      });
      console.log('workout', workout);
      console.log('assignWorkoutDto', assignWorkoutDto);
      workout.date = new Date();
      workout.dayOfWeek = assignWorkoutDto.dayOfWeek;
      console.log('clientId', assignWorkoutDto.clientId);

      const clientSubscription = await this.clientSubscriptionRepository
        .createQueryBuilder('clientSubscription')
        .innerJoinAndSelect('clientSubscription.client', 'client')
        .innerJoinAndSelect('clientSubscription.subscription', 'subscription')
        .where('client.id = :clientId', { clientId: assignWorkoutDto.clientId })
        .getOne();

      console.log('clientSubscription', clientSubscription);
      if (!clientSubscription) {
        return new Error('Client subscription not found');
      }

      // Ahora que tienes la suscripción, puedes asignarla al workout
      workout.subscription = clientSubscription.subscription;
      return this.workoutRepository.save(workout);
    } catch (error) {
      return new Error('Error assigning workout');
    }
  }

  async findAllByCoachId(coachId: number): Promise<any> {
    const workouts = await this.workoutRepository.find({
      where: { coach: { id: coachId } },
      relations: ['groups', 'groups.exercises', 'groups.exercises.exercise'],
    });
    return workouts;
    return workouts.map((workout) => ({
      ...workout,
      groups: workout.groups.map((group) => ({
        ...group,
        exercises: group.exercises.map((exerciseInstance) => ({
          ...exerciseInstance.exercise,
          details: { ...exerciseInstance },
        })),
      })),
    }));
  }

  async findAllBySubscriptionId(clientId: number): Promise<any> {
    const clientWorkouts = await this.workoutRepository
      .createQueryBuilder('workout')
      .innerJoinAndSelect('workout.subscription', 'subscription')
      .innerJoinAndSelect('subscription.client', 'client')
      .where('client.id = :clientId', { clientId: clientId })
      .getMany();
    const subscription = await this.clientSubscriptionRepository.findOneBy({
      id: clientId,
    });
    if (!subscription) {
      throw new Error('Client subscription not found');
    }
    const workouts = await this.workoutRepository.find({
      where: { subscription: { id: subscription.id } },
      relations: ['groups', 'groups.exercises', 'groups.exercises.exercise'],
    });
    return {
      workouts,
      clientWorkouts,
    };
    return workouts.map((workout) => ({
      ...workout,
      groups: workout.groups.map((group) => ({
        ...group,
        exercises: group.exercises.map((exerciseInstance) => ({
          ...exerciseInstance.exercise,
          details: { ...exerciseInstance },
        })),
      })),
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} workout`;
  }

  update(id: number, updateWorkoutDto: UpdateWorkoutDto) {
    return `This action updates a #${id} workout`;
  }

  remove(id: number) {
    return `This action removes a #${id} workout`;
  }
}
