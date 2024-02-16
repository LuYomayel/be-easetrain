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
import { Coach } from 'src/user/entities/coach.entity';
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
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
  ) {}

  async create(createWorkoutDto: CreateWorkoutDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const coach = await this.coachRepository.findOneBy({
        user: { id: createWorkoutDto.coachId },
      });
      const newWorkout = {
        ...createWorkoutDto,
        coach,
      };
      const workout = queryRunner.manager.create(Workout, newWorkout);
      const savedWorkout = await queryRunner.manager.save(workout);
      console.log('savedWorkout', savedWorkout);
      console.log('createWorkoutDto', createWorkoutDto);

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
    // Paso 1: Obtener la suscripción del cliente
    const clientSubscription = await this.clientSubscriptionRepository
      .createQueryBuilder('clientSubscription')
      .innerJoinAndSelect('clientSubscription.subscription', 'subscription')
      .innerJoinAndSelect('clientSubscription.client', 'client')
      .where('client.id = :clientId', { clientId })
      .getOne();
    console.log('clientSubscription', clientSubscription);
    if (!clientSubscription) {
      // Manejar el caso de que no se encuentre la suscripción, por ejemplo, devolver todos los workouts del coach
      // o manejar como un error, dependiendo de la lógica de negocio.
      console.log('No subscription found for client');
      return [];
    }

    // Paso 2: Buscar workouts por coachId excluyendo los asociados a la suscripción del cliente
    const subscriptionId = clientSubscription.subscription.id;
    console.log('subscriptionId', subscriptionId);
    const workouts = await this.workoutRepository
      .createQueryBuilder('workout')
      .innerJoinAndSelect('workout.coach', 'coach', 'coach.id = :coachId', {
        coachId,
      })
      .leftJoinAndSelect('workout.groups', 'groups')
      .leftJoinAndSelect('groups.exercises', 'exercises')
      .leftJoinAndSelect('exercises.exercise', 'exercise')
      .where(
        'workout.subscriptionId != :subscriptionId OR workout.subscriptionId IS NULL',
        { subscriptionId },
      )
      .getMany();

    return workouts;
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
