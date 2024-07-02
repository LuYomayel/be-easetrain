import { Injectable } from '@nestjs/common';
import { AssignWorkoutDto, CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Workout, WorkoutInstance } from './entities/workout.entity';
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
    @InjectRepository(WorkoutInstance)
    private workoutInstanceRepository: Repository<WorkoutInstance>,
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
      // Crear la plantilla Workout
      const coach = await this.coachRepository.findOneBy({
        user: { id: createWorkoutDto.coachId },
      });
      
      const newWorkout = {
        planName: createWorkoutDto.planName,
        coach,
      };

      const workout = queryRunner.manager.create(Workout, newWorkout);
      const savedWorkout = await queryRunner.manager.save(workout);
      
      // Crear la instancia de WorkoutInstance
      const workoutInstanceData = {
        workout: savedWorkout,
        personalizedNotes: '',
        status: 'pending',
        isTemplate: true,
        ...createWorkoutDto.workoutInstances[0]
      };

      
      const workoutInstance = queryRunner.manager.create(
        WorkoutInstance,
        workoutInstanceData,
      );
      const savedWorkoutInstance = await queryRunner.manager.save(
        workoutInstance,
      );
      
      // Crear y asociar los grupos de ejercicios a la instancia de WorkoutInstance
      for (const groupDto of createWorkoutDto.workoutInstances[0].groups) {
        const exerciseGroup = queryRunner.manager.create(ExerciseGroup, {
          set: groupDto.set,
          rest: groupDto.rest,
          groupNumber: groupDto.groupNumber,
          workoutInstance: savedWorkoutInstance,
        });
        const savedGroup = await queryRunner.manager.save(exerciseGroup);
        console.log(savedGroup)
        for (const exerciseDto of groupDto.exercises) {
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
          };
          const exerciseInstance = queryRunner.manager.create(
            ExerciseInstance,
            exerciseInstanceData,
          );
          await queryRunner.manager.save(exerciseInstance);
        }
      }

      await queryRunner.commitTransaction();
      return savedWorkoutInstance;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // async copyWorkoutPlan(planId: number): Promise<Workout> {
  //   const workoutPlan = await this.workoutRepository.findOne({
  //     where: { id: planId },
  //     relations: ['groups', 'groups.exercises', 'groups.exercises.exercise'],
  //   });

  //   if (!workoutPlan) {
  //     throw new Error('Workout plan not found');
  //   }

  //   // Crear el nuevo Workout sin relaciones
  //   const newWorkoutPlan = this.workoutRepository.create({
  //     planName: `Copia - ${workoutPlan.planName}`,
  //     dateAssigned: new Date(),
  //     status: 'pending',
  //   });

  //   const savedWorkout = await this.workoutRepository.save(newWorkoutPlan);

  //   // Recorrer los grupos y ejercicios para crear nuevas instancias
  //   for (const group of workoutPlan.groups) {
  //     const newGroup = this.exerciseGroupRepository.create({
  //       set: group.set,
  //       rest: group.rest,
  //       groupNumber: group.groupNumber,
  //       workout: savedWorkout,
  //     });

  //     const savedGroup = await this.exerciseGroupRepository.save(newGroup);

  //     for (const exercise of group.exercises) {
  //       console.log(exercise)
  //       const newExercise = this.exerciseInstanceRepository.create({
  //         exercise: exercise.exercise,
  //         group: savedGroup,
  //         repetitions: exercise.repetitions,
  //         sets: exercise.sets,
  //         time: exercise.time,
  //         weight: exercise.weight,
  //         restInterval: exercise.restInterval,
  //         tempo: exercise.tempo,
  //         notes: exercise.notes,
  //         difficulty: exercise.difficulty,
  //         duration: exercise.duration,
  //         distance: exercise.distance,
  //       });

  //       await this.exerciseInstanceRepository.save(newExercise);
  //     }
  //   }

  //   return savedWorkout;
  // }

  async updateWorkoutTemplate(updateWorkoutDto: UpdateWorkoutDto) {
    const queryRunner = this.dataSource.createQueryRunner();
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // Encontrar la plantilla Workout
      const existingWorkout = await this.workoutRepository.findOne({
        where: { id: updateWorkoutDto.id },
      });
      
      if (!existingWorkout) {
        throw new Error('Workout not found');
      }
      // Actualizar la plantilla Workout
      const updatedWorkout = {
        ...existingWorkout,
        planName: updateWorkoutDto.planName,
      };
      await queryRunner.manager.save(Workout, updatedWorkout);
      console.log('HAsta aca')
      // Encontrar la instancia de WorkoutInstance que es la plantilla (isTemplate: true)
      const existingWorkoutInstance = await this.workoutInstanceRepository.findOne({
        where: { workout: { id: updateWorkoutDto.id }, isTemplate: true },
        relations: ['groups', 'groups.exercises', 'groups.exercises.exercise'],
      });
      if (!existingWorkoutInstance) {
        throw new Error('Template workout instance not found');
      }
  
      // Actualizar la instancia WorkoutInstance
      const updatedWorkoutInstance = {
        ...existingWorkoutInstance,
        ...updateWorkoutDto,
        workout: updatedWorkout,
        isTemplate: true,
      };
      const savedWorkoutInstance = await queryRunner.manager.save(
        WorkoutInstance,
        updatedWorkoutInstance,
      );
        // console.log('savedWorkoutInstance: ', savedWorkoutInstance)
      // Actualizar o crear los grupos de ejercicios
      for (const groupDto of updateWorkoutDto.workoutInstances[0].groups) {
        
        const existingGroup = existingWorkoutInstance.groups.find(g => g.id === groupDto.id);
  
        const exerciseGroup = existingGroup
          ? {
              ...existingGroup,
              ...groupDto,
            }
          : queryRunner.manager.create(ExerciseGroup, {
              ...groupDto,
              workoutInstance: savedWorkoutInstance,
            });
            // console.log('exerciseGroup: ', exerciseGroup)
            
        const savedGroup = await queryRunner.manager.save(ExerciseGroup, exerciseGroup);
        // Actualizar o crear las instancias de ejercicios
        for (const exerciseDto of groupDto.exercises) {
          const existingExercise = existingGroup?.exercises.find(e => e.id === exerciseDto.id);
  
          const exerciseInstance = existingExercise
            ? {
                ...existingExercise,
                ...exerciseDto,
                group: savedGroup,
              }
            : queryRunner.manager.create(ExerciseInstance, {
                ...exerciseDto,
                exercise: { id: exerciseDto.exercise.id },
                group: savedGroup,
              });
  
          await queryRunner.manager.save(ExerciseInstance, exerciseInstance);
        }
      }
  
      await queryRunner.commitTransaction();
      return savedWorkoutInstance;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateWorkoutInstance(updateWorkoutDto: UpdateWorkoutDto) {
    const queryRunner = this.dataSource.createQueryRunner();
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // Encontrar la instancia de WorkoutInstance
      const existingWorkoutInstance = await this.workoutInstanceRepository.findOne({
        where: { id: updateWorkoutDto.id, isTemplate: false },
        relations: ['groups', 'groups.exercises', 'groups.exercises.exercise'],
      });
  
      if (!existingWorkoutInstance) {
        throw new Error('Workout instance not found');
      }
  
      // Actualizar la instancia WorkoutInstance
      const updatedWorkoutInstance = {
        ...existingWorkoutInstance,
        ...updateWorkoutDto,
        isTemplate: false,
      };
      const savedWorkoutInstance = await queryRunner.manager.save(
        WorkoutInstance,
        updatedWorkoutInstance,
      );
  
      // Actualizar o crear los grupos de ejercicios
      for (const groupDto of updateWorkoutDto.groups) {
        const existingGroup = existingWorkoutInstance.groups.find(g => g.id === groupDto.id);
  
        const exerciseGroup = existingGroup
          ? {
              ...existingGroup,
              ...groupDto,
            }
          : queryRunner.manager.create(ExerciseGroup, {
              ...groupDto,
              workoutInstance: savedWorkoutInstance,
            });
  
        const savedGroup = await queryRunner.manager.save(ExerciseGroup, exerciseGroup);
  
        // Actualizar o crear las instancias de ejercicios
        for (const exerciseDto of groupDto.exercises) {
          const existingExercise = existingGroup?.exercises.find(e => e.id === exerciseDto.id);
  
          const exerciseInstance = existingExercise
            ? {
                ...existingExercise,
                ...exerciseDto,
                group: savedGroup,
              }
            : queryRunner.manager.create(ExerciseInstance, {
                ...exerciseDto,
                exercise: { id: exerciseDto.exercise.id },
                group: savedGroup,
              });
  
          await queryRunner.manager.save(ExerciseInstance, exerciseInstance);
        }
      }
  
      await queryRunner.commitTransaction();
      return savedWorkoutInstance;
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
        .leftJoinAndSelect('workout.workoutInstances', 'workoutInstance')
        // .leftJoinAndSelect('workoutInstance.groups', 'group') // Relacionar con los grupos de la instancia de workout
        // .leftJoinAndSelect('group.exercises', 'exerciseInstance') // Correctamente aliasado como 'exerciseInstance'
        // .leftJoinAndSelect('exerciseInstance.exercise', 'exercise')
        .getMany();
  
      return allWorkouts;
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw new Error('Error fetching workouts');
    }
  }

  async assignWorkout(assignWorkoutDto: AssignWorkoutDto) {
    const { planId, studentId, expectedStartDate, expectedEndDate, notes, status } = assignWorkoutDto;
  
    const workout = await this.workoutRepository.findOne({
      where: { id: planId }
    });
  
    if (!workout) {
      throw new Error('Workout does not exist!');
    }
  
    // Buscar la workoutInstance que es plantilla
    const templateInstance = await this.workoutInstanceRepository.findOne({
      where: { workout: { id: planId }, isTemplate: true },
      relations: ['groups', 'groups.exercises'],
    });
  
    if (!templateInstance) {
      throw new Error('Template workout instance not found');
    }
  
    // Buscar la suscripción del cliente
    const clientSubscription = await this.clientSubscriptionRepository.findOne({
      where: { id: studentId },
    });
  
    if (!clientSubscription) {
      throw new Error('Client subscription not found');
    }
  
    // Crear una nueva workoutInstance basada en la plantilla
    const newWorkoutInstance = this.workoutInstanceRepository.create({
      expectedStartDate,
      expectedEndDate,
      personalizedNotes: notes,
      status,
      isTemplate: false,
      dateAssigned: new Date(),
      dateCompleted: null,
      feedback: '',
      groups: [],
      isRepeated: false,
      realEndDate: null,
      realStartedDate: null,
      repeatDays: [],
      clientSubscription: clientSubscription,
      workout: workout,
    });
  
    const savedWorkoutInstance = await this.workoutInstanceRepository.save(newWorkoutInstance);
  
    // Copiar grupos y ejercicios
    for (const group of templateInstance.groups) {
      const newGroup = this.exerciseGroupRepository.create({
        set: group.set,
        rest: group.rest,
        groupNumber: group.groupNumber,
        workoutInstance: savedWorkoutInstance,
      });
  
      const savedGroup = await this.exerciseGroupRepository.save(newGroup);
  
      for (const exercise of group.exercises) {
        const newExercise = this.exerciseInstanceRepository.create({
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
          exercise: exercise.exercise,
          group: savedGroup,
        });
        console.log(newExercise);
        await this.exerciseInstanceRepository.save(newExercise);
      }
    }
  
    return savedWorkoutInstance;
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

  async findAllByUserId(userId: number): Promise<any> {
    try {
      const userWorkouts = await this.workoutInstanceRepository
        .createQueryBuilder('workoutInstance')
        .innerJoin('workoutInstance.clientSubscription', 'clientSubscription')
        .innerJoin('clientSubscription.client', 'client')
        .innerJoin('client.user', 'user')
        .innerJoinAndSelect('workoutInstance.workout', 'workout')
        .leftJoinAndSelect('workoutInstance.groups', 'group')
        .leftJoinAndSelect('group.exercises', 'exerciseInstance')
        .leftJoinAndSelect('exerciseInstance.exercise', 'exercise')
        .where('user.id = :userId', { userId })
        .getMany();
      return userWorkouts;
    } catch (error) {
      console.error('Error fetching workouts by user ID:', error);
      throw new Error('Error fetching workouts for the user');
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
    const workout = await this.workoutInstanceRepository
        .createQueryBuilder('workoutInstance')
        .leftJoinAndSelect('workoutInstance.workout', 'workout')
        .leftJoinAndSelect('workoutInstance.groups', 'group')
        .leftJoinAndSelect('group.exercises', 'exerciseInstance')
        .leftJoinAndSelect('exerciseInstance.exercise', 'exercise')
        .where('workoutInstance.id = :workoutId', { workoutId })
        // .andWhere('workoutInstance.isTemplate = :isTemplate', { isTemplate: true })
        .getOne();
    console.log(workout, workoutId)
    return workout;
}

async removeWorkout(planId: number) {
  const queryRunner = this.dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const workoutPlan = await this.workoutRepository.findOne({
      where: { id: planId },
      relations: ['workoutInstances', 'workoutInstances.groups', 'workoutInstances.groups.exercises'],
    });

    if (!workoutPlan) {
      throw new Error('Workout plan not found');
    }

    // Verificar si existen instancias de WorkoutInstance asignadas a alumnos
    const assignedInstances = await this.workoutInstanceRepository.find({
      where: { workout: { id: planId }, isTemplate: false },
    });

    if (assignedInstances.length > 0) {
      throw new Error('Cannot delete workout plan that has assigned instances');
    }

    // Eliminar la instancia de plantilla (isTemplate: true)
    const templateInstance = await this.workoutInstanceRepository.findOne({
      where: { workout: { id: planId }, isTemplate: true },
      relations: ['groups', 'groups.exercises'],
    });

    if (templateInstance) {
      // Eliminar las instancias de ejercicios
      for (const group of templateInstance.groups) {
        for (const exercise of group.exercises) {
          await this.exerciseInstanceRepository.delete(exercise.id);
        }
      }

      // Eliminar los grupos
      for (const group of templateInstance.groups) {
        await this.exerciseGroupRepository.delete(group.id);
      }

      // Eliminar la instancia de plantilla
      await this.workoutInstanceRepository.delete(templateInstance.id);
    }

    // Eliminar el plan de entrenamiento
    await this.workoutRepository.delete(planId);

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

    async removeWorkoutInstance(instanceId: number) {
      const queryRunner = this.dataSource.createQueryRunner();
    
      await queryRunner.connect();
      await queryRunner.startTransaction();
    
      try {
        const workoutInstance = await this.workoutInstanceRepository.findOne({
          where: { id: instanceId, isTemplate: false },
          relations: ['groups', 'groups.exercises'],
        });
    
        if (!workoutInstance) {
          throw new Error('Workout instance not found');
        }
    
        // Eliminar las instancias de ejercicios
        for (const group of workoutInstance.groups) {
          for (const exercise of group.exercises) {
            await this.exerciseInstanceRepository.delete(exercise.id);
          }
        }
    
        // Eliminar los grupos
        for (const group of workoutInstance.groups) {
          await this.exerciseGroupRepository.delete(group.id);
        }
    
        // Eliminar la instancia de workout
        await this.workoutInstanceRepository.delete(instanceId);
    
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }

}
