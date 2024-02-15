import { Injectable } from '@nestjs/common';
import { AssignWorkoutDto, CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workout } from './entities/workout.entity';
import { DataSource } from 'typeorm';
import { ExerciseGroup } from '../exercise/entities/exercise-group.entity';
import { ExerciseInstance } from '../exercise/entities/exercise.entity';
import { ClientSubscription } from '../subscription/entities/client.subscription.entity';
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
    const workout = await this.workoutRepository.findOneBy({
      id: assignWorkoutDto.workoutId,
    });
    console.log('workout', workout);
    console.log('assignWorkoutDto', assignWorkoutDto);
    workout.date = new Date();
    workout.dayOfWeek = assignWorkoutDto.dayOfWeek;
    workout.coach.id = assignWorkoutDto.coachId;
    const subscriptionId = await this.clientSubscriptionRepository.findOneBy({
      id: assignWorkoutDto.clientId,
    });
    console.log('subscriptionId', subscriptionId);
    if (!subscriptionId) {
      throw new Error('Client subscription not found');
    }
    workout.subscription.id = subscriptionId.id;
    console.log('workout', workout);
    return this.workoutRepository.save(workout);
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
