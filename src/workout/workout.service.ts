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

  async findAllWorkoutsByCoachIdExcludingClientId(
    coachId: number,
    clientId: number,
  ): Promise<Workout[]> {
    // Primero, obtén el o los ID(s) de Subscription asociados con el clientId a través de ClientSubscription
    const clientSubscriptions = await this.clientSubscriptionRepository
      .createQueryBuilder('clientSubscription')
      .innerJoin('clientSubscription.client', 'client')
      .innerJoin('clientSubscription.subscription', 'subscription')
      .where('client.id = :clientId', { clientId })
      .select('subscription.id')
      .getMany();

    const subscriptionIds = clientSubscriptions.map((cs) => cs.subscription.id);
    console.log('subscriptionIds', subscriptionIds);
    // Luego, realiza la consulta para obtener los workouts del coachId, excluyendo aquellos con los ID(s) de Subscription obtenidos anteriormente
    const coachWorkouts = await this.workoutRepository
      .createQueryBuilder('workout')
      .innerJoin('workout.coach', 'coach')
      .leftJoin('workout.subscription', 'subscription')
      .where('coach.id = :coachId', { coachId })
      .andWhere(
        subscriptionIds.length > 0
          ? 'subscription.id NOT IN (:...subscriptionIds)'
          : '1=1',
        { subscriptionIds },
      )
      .leftJoinAndSelect('workout.groups', 'group')
      .leftJoinAndSelect('group.exercises', 'exerciseInstance')
      .leftJoinAndSelect('exerciseInstance.exercise', 'exercise')
      .getMany();

    return coachWorkouts;
  }

  async findAllByClientId(clientId: number): Promise<any> {
    try {
      const clientWorkouts = await this.workoutRepository
        .createQueryBuilder('workout')
        .innerJoin('workout.subscription', 'subscription')
        .innerJoin('subscription.user', 'user')
        .leftJoinAndSelect('workout.groups', 'group') // Asume que la relación se llama 'groups' en 'Workout'

        .leftJoinAndSelect('group.exercises', 'exerciseInstance') // Correctly aliasing as 'exerciseInstance'
        .leftJoinAndSelect('exerciseInstance.exercise', 'exercise')
        .where('user.id = :clientId', { clientId })
        // .andWhere('subscription.isDeleted = false') // Si solo quieres las suscripciones activas
        .getMany();

      return clientWorkouts;
    } catch (error) {
      console.error('Error fetching workouts by client ID:', error);
      throw new Error('Error fetching workouts for the client');
    }
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
