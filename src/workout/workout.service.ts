import { Injectable } from '@nestjs/common';
import { AssignWorkoutDto, CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Workout } from './entities/workout.entity';
import { DataSource } from 'typeorm';
import { ExerciseGroup } from '../exercise/entities/exercise-group.entity';
import { Exercise, ExerciseInstance } from '../exercise/entities/exercise.entity';
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
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
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
  
      for (const groupDto of createWorkoutDto.groups) {
        const exerciseGroup = queryRunner.manager.create(ExerciseGroup, {
          set: groupDto.set,
          rest: groupDto.rest,
          groupNumber: groupDto.groupNumber,
          workout: savedWorkout,
        });
        const savedGroup = await queryRunner.manager.save(exerciseGroup);
  
        for (const exerciseDto of groupDto.exercises) {
          console.log(exerciseDto)
          const exerciseInstanceData = {
            exercise: { id: exerciseDto.exercise.id }, // Relación a la entidad Exercise
            group: savedGroup,
            repetitions: exerciseDto.repetitions,
            sets: exerciseDto.sets,
            time: exerciseDto.time,
            weight: exerciseDto.weight,
            restInterval: exerciseDto.restInterval,
            tempo: exerciseDto.tempo,
            notes: exerciseDto.notes,
            difficulty: exerciseDto.difficulty,
            duration: exerciseDto.duration,
            distance: exerciseDto.distance,
            videoUrl: exerciseDto.videoUrl,
          };
          const exerciseInstance = queryRunner.manager.create(
            ExerciseInstance,
            exerciseInstanceData,
          );
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

  async copyWorkoutPlan(planId: number): Promise<Workout> {
    const workoutPlan = await this.workoutRepository.findOne({
      where: { id: planId },
      relations: ['groups', 'groups.exercises', 'groups.exercises.exercise'],
    });

    if (!workoutPlan) {
      throw new Error('Workout plan not found');
    }

    // Crear el nuevo Workout sin relaciones
    const newWorkoutPlan = this.workoutRepository.create({
      planName: `Copia - ${workoutPlan.planName}`,
      dateAssigned: new Date(),
      status: 'pending',
    });

    const savedWorkout = await this.workoutRepository.save(newWorkoutPlan);

    // Recorrer los grupos y ejercicios para crear nuevas instancias
    for (const group of workoutPlan.groups) {
      const newGroup = this.exerciseGroupRepository.create({
        set: group.set,
        rest: group.rest,
        groupNumber: group.groupNumber,
        workout: savedWorkout,
      });

      const savedGroup = await this.exerciseGroupRepository.save(newGroup);

      for (const exercise of group.exercises) {
        console.log(exercise)
        const newExercise = this.exerciseInstanceRepository.create({
          exercise: exercise.exercise,
          group: savedGroup,
          repetitions: exercise.repetitions,
          sets: exercise.sets,
          time: exercise.time,
          weight: exercise.weight,
          restInterval: exercise.restInterval,
          tempo: exercise.tempo,
          notes: exercise.notes,
          difficulty: exercise.difficulty,
          duration: exercise.duration,
          distance: exercise.distance,
        });

        await this.exerciseInstanceRepository.save(newExercise);
      }
    }

    return savedWorkout;
  }

  async update(updateWorkoutDto: UpdateWorkoutDto) {
    const queryRunner = this.dataSource.createQueryRunner();
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const existingWorkout = await this.workoutRepository.findOne({
        where: { id: updateWorkoutDto.id },
        relations: ['groups', 'groups.exercises', 'groups.exercises.exercise'], // Incluye las relaciones necesarias
      });
      // console.log(existingWorkout)
      if (!existingWorkout) {
        throw new Error('Workout not found');
      }
  
      const updatedWorkout = {
        ...existingWorkout,
        ...updateWorkoutDto,      
      };
      // console.log(updatedWorkout)
      await queryRunner.manager.save(Workout, updatedWorkout);
  
      for (const groupDto of updateWorkoutDto.groups) {
        const existingGroup = existingWorkout.groups.find(g => g.id === groupDto.id);
        // console.log('existingGroup: ', existingGroup, groupDto)
        const exerciseGroup = existingGroup ? {
          ...existingGroup,
          ...groupDto,
        } : queryRunner.manager.create(ExerciseGroup, {
          ...groupDto,
          workout: existingWorkout,
        });
        
        const savedGroup = await queryRunner.manager.save(ExerciseGroup, exerciseGroup);
        
        for (const exerciseDto of groupDto.exercises) {
          const existingExercise = existingGroup?.exercises.find(e => e.id === exerciseDto.id);
          const exerciseInstance = existingExercise ? {
            ...existingExercise,
            ...exerciseDto,
            group: savedGroup,
          } : queryRunner.manager.create(ExerciseInstance, {
            ...exerciseDto,
            exercise: { id: exerciseDto.exercise.id },
            group: savedGroup,
          });
  
          await queryRunner.manager.save(ExerciseInstance, exerciseInstance);
        }
      }
  
      await queryRunner.commitTransaction();
      return updatedWorkout;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    try {
      const allWorkouts = await this.workoutRepository
        .createQueryBuilder('workout')
        .leftJoinAndSelect('workout.groups', 'group') // Asume que la relación se llama 'groups' en 'Workout'
        .leftJoinAndSelect('group.exercises', 'exerciseInstance') // Correctly aliasing as 'exerciseInstance'
        .leftJoinAndSelect('exerciseInstance.exercise', 'exercise')
        // .andWhere('subscription.isDeleted = false') // Si solo quieres las suscripciones activas
        .getMany();

      return allWorkouts;
    } catch (error) {
      console.error('Error fetching workouts by client ID:', error);
      throw new Error('Error fetching workouts for the client');
    }
  }

  async assignWorkout(assignWorkoutDto: AssignWorkoutDto) {
    try {
      const alreadyAssignedWorkouts = [];
      for(const workout of assignWorkoutDto.workouts){
        // Verificar si el workout ya está asignado a la suscripción del cliente
        const existingAssignment = await this.workoutRepository.findOne({
          where: {
            id: workout.id,
            clientSubscription: { id: assignWorkoutDto.clientSubscription.id },
          },
        });
        if (existingAssignment) {
          console.log(`Workout ${workout.id} is already assigned to subscription ${assignWorkoutDto.clientSubscription.id}`);
          alreadyAssignedWorkouts.push(workout.planName);
        } else {
          // Actualizar el workout
          const updatedWorkout = await this.workoutRepository.update(
            { id: workout.id },
            {
              clientSubscription: { id: assignWorkoutDto.clientSubscription.id },
              dateAssigned: new Date(),
              status: 'pending',
            },
          );
          
        }
      }
      
      if (alreadyAssignedWorkouts.length > 0) {
        return {
          message: 'Some workouts were already assigned to the selected user',
          alreadyAssignedWorkouts,
        };
      }

      return { message: 'All workouts assigned successfully' };
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
        .innerJoin('workout.clientSubscription', 'clientSubscription')
        .innerJoin('clientSubscription.client', 'client')
        .leftJoinAndSelect('workout.groups', 'group') // Asume que la relación se llama 'groups' en 'Workout'
        .leftJoinAndSelect('group.exercises', 'exerciseInstance') // Correctly aliasing as 'exerciseInstance'
        .leftJoinAndSelect('exerciseInstance.exercise', 'exercise')
        .where('clientSubscription.id = :clientId', { clientId })
        // .andWhere('subscription.isDeleted = false') // Si solo quieres las suscripciones activas
        .getMany();

      return clientWorkouts;
    } catch (error) {
      console.error('Error fetching workouts by client ID:', error);
      throw new Error('Error fetching workouts for the client');
    }
  }

  async findAllByCoachId(coachId: number): Promise<any> {
    try {
      const coachWorkouts = await this.workoutRepository
        .createQueryBuilder('workout')
        .innerJoin('workout.coach', 'coach')
        .leftJoinAndSelect('workout.groups', 'group') // Asume que la relación se llama 'groups' en 'Workout'
        .leftJoinAndSelect('group.exercises', 'exerciseInstance') // Correctly aliasing as 'exerciseInstance'
        .leftJoinAndSelect('exerciseInstance.exercise', 'exercise')
        .where('coach.id = :coachId', { coachId })
        .getMany();

      return coachWorkouts;
    } catch (error) {
      console.error('Error fetching workouts by coach ID:', error);
      throw new Error('Error fetching workouts for the coach');
    }
  }

  async findOneWorkoutByClientId(clientId: number, planId: number): Promise<any> {
    try {
      const workout = await this.workoutRepository
        .createQueryBuilder('workout')
        .leftJoinAndSelect('workout.clientSubscription', 'clientSubscription')
        .leftJoinAndSelect('clientSubscription.client', 'client')
        .leftJoinAndSelect('workout.groups', 'group')
        .leftJoinAndSelect('group.exercises', 'exerciseInstance')
        .leftJoinAndSelect('exerciseInstance.exercise', 'exercise')
        .where('client.id = :clientId', { clientId })
        .andWhere('workout.id = :planId', { planId })
        .getOne();
  
      if (!workout) {
        throw new Error('Workout not found');
      }
      console.log('workout: ', workout)
      return workout;
    } catch (error) {
      console.error('Error fetching workout details:', error);
      throw new Error('Error fetching workout details');
    }
  }
  async findOne(workoutId: number) {
    const allWorkouts = await this.workoutRepository
        .createQueryBuilder('workout')
        .leftJoinAndSelect('workout.groups', 'group') // Asume que la relación se llama 'groups' en 'Workout'
        .leftJoinAndSelect('group.exercises', 'exerciseInstance') // Correctly aliasing as 'exerciseInstance'
        .leftJoinAndSelect('exerciseInstance.exercise', 'exercise')
        .where('workout.id = :workoutId', {workoutId}) // Si solo quieres las suscripciones activas
        .getOne();

      return allWorkouts;
    } 

  async remove(planId: number) {
    const workoutPlan = await this.workoutRepository.findOne({
      where: { id: planId },
      relations: ['groups', 'groups.exercises'],
    });

    if (!workoutPlan) {
      throw new Error('Workout plan not found');
    }

    // Eliminar las instancias de ejercicios
    for (const group of workoutPlan.groups) {
      for (const exercise of group.exercises) {
        await this.exerciseInstanceRepository.delete(exercise.id);
      }
    }

    // Eliminar los grupos
    for (const group of workoutPlan.groups) {
      await this.exerciseGroupRepository.delete(group.id);
    }

    // Eliminar el plan de entrenamiento
    await this.workoutRepository.delete(planId);
  }

  async seedDatabase() {
    // return 'Hola'
    const clientSubscription = await this.clientSubscriptionRepository.findOne({ where: { id: 23 } }); // Asumiendo que el cliente con id 1 existe
    // return clientSubscription;
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
  
    const generatePastDate = (daysAgo: number) => {
      const date = new Date(today);
      date.setDate(today.getDate() - daysAgo);
      return date;
    };
  
    const generateFutureDate = (daysFromNow: number) => {
      const date = new Date(today);
      date.setDate(today.getDate() + daysFromNow);
      return date;
    };
  
    const workouts = [];
  
    // Crear 10 planes vencidos
    for (let i = 0; i < 10; i++) {
      const workout = new Workout();
      workout.clientSubscription = clientSubscription;
      workout.planName = `Past Plan ${i + 1}`;
      workout.expectedStartDate = generatePastDate(30 + i * 7);
      workout.expectedEndDate = generatePastDate(30 + (i + 1) * 7);
      workout.realStartedDate = generatePastDate(30 + i * 7);
      workout.realEndDate = generatePastDate(30 + (i + 1) * 7);
      workout.status = 'completed';
      workout.isRepetead = true;
      workouts.push(workout);
    }
  
    // Crear 5 planes futuros
    for (let i = 0; i < 5; i++) {
      const workout = new Workout();
      workout.clientSubscription = clientSubscription;
      workout.planName = `Future Plan ${i + 1}`;
      workout.expectedStartDate = generateFutureDate(i * 7);
      workout.expectedEndDate = generateFutureDate((i + 1) * 7);
      workout.status = 'pending';
      workout.isRepetead = true;
      workouts.push(workout);
    }
  
    await this.workoutRepository.save(workouts);
    console.log(workouts)
    // return workouts;
    const exercise = await this.exerciseRepository.findOne({ where: {id:1}})
    // Crear grupos y ejercicios de ejemplo para cada plan (opcional)
    for (const workout of workouts) {
      const exerciseGroup = new ExerciseGroup();
      exerciseGroup.set = 3;
      exerciseGroup.rest = 60;
      exerciseGroup.groupNumber = 1;
      exerciseGroup.workout = workout;
  
      const savedGroup = await this.exerciseGroupRepository.save(exerciseGroup);
      
      const exerciseInstance = new ExerciseInstance();
      exerciseInstance.exercise = exercise // Asumiendo que el ejercicio con id 1 existe
      exerciseInstance.group = savedGroup;
      exerciseInstance.repetitions = '10';
      exerciseInstance.sets = '3';
      exerciseInstance.time = '30';
      exerciseInstance.weight = '20kg';
      exerciseInstance.restInterval = '60s';
      exerciseInstance.tempo = '2-2-2';
      exerciseInstance.notes = 'Focus on form';
      exerciseInstance.difficulty = 'medium';
      exerciseInstance.duration = '10m';
      exerciseInstance.distance = '1km';
  
      await this.exerciseInstanceRepository.save(exerciseInstance);
    }
  
    console.log('Database seeded successfully!');
  }
}
