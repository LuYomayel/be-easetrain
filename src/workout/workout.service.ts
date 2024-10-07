import { Injectable } from '@nestjs/common';
import { AssignWorkoutDto, CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DeleteResult, In, Repository, UpdateResult } from 'typeorm';
import { IWorkoutInstance, Workout, WorkoutInstance } from './entities/workout.entity';
import { DataSource } from 'typeorm';
import { ExerciseGroup } from '../exercise/entities/exercise-group.entity';
import { Exercise, ExerciseInstance } from '../exercise/entities/exercise.entity';
import { ClientSubscription } from '../subscription/entities/client.subscription.entity';
import { EStatus, Subscription } from '../subscription/entities/subscription.entity';
import { User } from '../user/entities/user.entity';
import { Coach } from '../user/entities/coach.entity';
import { CreateFeedbackDto } from './dto/create-feedback-dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientActivity } from '../user/entities/client-activity.entity';
import { UserService } from '../user/user.service';
import { AssignWorkoutsToCycleDTO, CreateCycleDto } from './entities/create-cycle.dto';
import { TrainingCycle } from './entities/training-cycle.entity';
import { TrainingWeek } from './entities/training-week.entity';
import { TrainingSession } from './entities/training-session.entity';
import { ExerciseSetLog } from '../exercise/entities/exercise-set-log.entity';
import { OpenAI } from 'openai';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as FormData from 'form-data';
import { RpeAssignment } from './entities/rpe-assignment.entity';
import { RpeMethod } from './entities/rpe-method.entity';
import { CreateRpeDto } from './entities/create-rpe-dto';
import { UpdateRpeDto } from './entities/update-rpe-dto';
@Injectable()
export class WorkoutService {
  constructor(
    @InjectRepository(Workout)
    private workoutRepository: Repository<Workout>,
    @InjectRepository(WorkoutInstance)
    private workoutInstanceRepository: Repository<WorkoutInstance>,
    // private dataSource: DataSource,
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
    @InjectRepository(ClientActivity)
    private clientActivityRepository: Repository<ClientActivity>,
    private userService: UserService,
    @InjectRepository(TrainingCycle)
    private trainingCycleRepository: Repository<TrainingCycle>,
    @InjectRepository(TrainingSession)
    private trainingSessionRepository: Repository<TrainingSession>,
    @InjectRepository(ExerciseSetLog)
    private exerciseSetLogRepository: Repository<ExerciseSetLog>,
    @InjectRepository(RpeAssignment)
    private rpeAssignmentRepository: Repository<RpeAssignment>,
    @InjectRepository(RpeMethod)
    private rpeMethodRepository: Repository<RpeMethod>,
    
    @InjectDataSource() private readonly dataSource: DataSource,
    private openai: OpenAI,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    
  }

  async create(createWorkoutDto: CreateWorkoutDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear la plantilla Workout
      const coach = await this.coachRepository.findOneBy({
        user: { id: createWorkoutDto.workout.coach.user.id },
      });
      
      if (!coach) {
        throw new HttpException('Coach not found', HttpStatus.NOT_FOUND);
      }
      const sameNameWorkout = await this.workoutRepository.findOne({where: {planName: createWorkoutDto.workout.planName}})
      if(sameNameWorkout)
        throw new HttpException('Already exists a workout with that name.', HttpStatus.BAD_REQUEST);

      const newWorkout = {
        planName: createWorkoutDto.workout.planName,
        coach,
      };

      const workout = queryRunner.manager.create(Workout, newWorkout);
      const savedWorkout = await queryRunner.manager.save(workout);
      // Crear la instancia de WorkoutInstance
      const workoutInstanceData = {
        ...createWorkoutDto,
        workout: savedWorkout,
        personalizedNotes: createWorkoutDto.personalizedNotes,
        status: 'pending',
        isTemplate: true,
        groups: []
      };

      
      const workoutInstance = queryRunner.manager.create(
        WorkoutInstance,
        workoutInstanceData,
      );
      const savedWorkoutInstance = await queryRunner.manager.save(
        workoutInstance,
        );
      // Crear y asociar los grupos de ejercicios a la instancia de WorkoutInstance
      for (const groupDto of createWorkoutDto.groups) {
        const exerciseGroup = queryRunner.manager.create(ExerciseGroup, {
          set: groupDto.set,
          rest: groupDto.rest,
          groupNumber: groupDto.groupNumber,
          workoutInstance: savedWorkoutInstance,
        });
        const savedGroup = await queryRunner.manager.save(exerciseGroup);
        for (const exerciseDto of groupDto.exercises) {
          const exerciseInstanceData = {
            exercise: { id: exerciseDto.exercise.id }, // Relación a la entidad Exercise
            group: savedGroup,
            repetitions: exerciseDto.repetitions === '' ? null : exerciseDto.repetitions,
            sets: exerciseDto.sets === '' ? null : exerciseDto.sets,
            time: exerciseDto.time === '' ? null : exerciseDto.time,
            weight: exerciseDto.weight === '' ? null : exerciseDto.weight,
            restInterval: exerciseDto.restInterval === '' ? null : exerciseDto.restInterval,
            tempo: exerciseDto.tempo === '' ? null : exerciseDto.tempo,
            notes: exerciseDto.notes === '' ? null : exerciseDto.notes,
            difficulty: exerciseDto.difficulty === '' ? null : exerciseDto.difficulty,
            duration: exerciseDto.duration === '' ? null : exerciseDto.duration,
            distance: exerciseDto.distance === '' ? null : exerciseDto.distance,
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
      console.error("Error during transaction:", error);
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  async updateWorkoutTemplate(updateWorkoutDto: UpdateWorkoutDto) {
    const queryRunner = this.dataSource.createQueryRunner();
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
    // return;
    try {
      // Encontrar la plantilla Workout
      const existingWorkout = await this.workoutRepository.findOne({
        where: { id: updateWorkoutDto.workout.id },
      });
      
      if (!existingWorkout) {
        throw new HttpException('Workout not found', HttpStatus.NOT_FOUND);
      }
      // Actualizar la plantilla Workout
      const updatedWorkout = {
        ...existingWorkout,
        planName: updateWorkoutDto.workout.planName,
      };
      await queryRunner.manager.save(Workout, updatedWorkout);
      // Encontrar la instancia de WorkoutInstance que es la plantilla (isTemplate: true)
      const existingWorkoutInstance = await this.workoutInstanceRepository.findOne({
        where: { id: updateWorkoutDto.id , isTemplate: true },
        relations: ['groups', 'groups.exercises', 'groups.exercises.exercise'],
      });

      if (!existingWorkoutInstance) {
        throw new HttpException('Template workout instance not found', HttpStatus.NOT_FOUND);
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
      // Actualizar o crear los grupos de ejercicios
      for (const groupDto of updateWorkoutDto.groups) {
        
        const existingGroup = existingWorkoutInstance.groups.find(g => g.id === groupDto.id);
        const exerciseGroup = existingGroup
          ? {
              ...existingGroup,
              ...groupDto,
              workoutInstance: savedWorkoutInstance,
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
  
          const exerciseInstanceSaved = await queryRunner.manager.save(ExerciseInstance, exerciseInstance);
       
        }
      }
      await queryRunner.commitTransaction();
      return savedWorkoutInstance;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
        throw new HttpException('Workout instance not found', HttpStatus.NOT_FOUND);
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
              workoutInstance: savedWorkoutInstance,
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
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    try {
      const allWorkouts = await this.workoutRepository
        .createQueryBuilder('workout')
        .leftJoinAndSelect('workout.workoutInstances', 'workoutInstance')
        .getMany();
      if(allWorkouts.length === 0){
        throw new HttpException('Workout instances not found', HttpStatus.NOT_FOUND);
      }
      return allWorkouts;
    } catch (error) {
      throw new HttpException('Error finding all workout instances', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllTrainingCyclesByCoach(coachId: number){
    try {
      const allTrainingCycles = await this.trainingCycleRepository.find({
        relations: ['trainingWeeks','trainingWeeks.trainingSessions', 'client', 'trainingWeeks.trainingSessions.workoutInstances', 'trainingWeeks.trainingSessions.workoutInstances.workout'],
        where: { coach: { user: { id: coachId}}}
      })

      return allTrainingCycles;
    } catch (error) {
      console.error(error)
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllTrainingCyclesForClientByUserId(studentId: number) {
    try {
      const allTrainingCycles = await this.trainingCycleRepository.find({
        relations: [
          'client',
          'trainingWeeks', 
          'trainingWeeks.trainingSessions', 
          'trainingWeeks.trainingSessions.workoutInstances', 
          'trainingWeeks.trainingSessions.workoutInstances.workout'],
        where: { client: { user: { id: studentId } } }
      });
      return allTrainingCycles;
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async findAllTrainingCyclesForClientByClientId(studentId: number) {
    try {
      const allTrainingCycles = await this.trainingCycleRepository.find({
        relations: [
          'client',
          'trainingWeeks', 
          'trainingWeeks.trainingSessions', 
          'trainingWeeks.trainingSessions.workoutInstances', 
          'trainingWeeks.trainingSessions.workoutInstances.workout'],
        where: { client: { id: studentId } }
      });
      return allTrainingCycles;
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findTrainingCyclesByCycleIdAndDayNumber(cycleId: number, dayNumber: number) {
    try {
      const trainingCycles = await this.trainingCycleRepository.find({
        where: {
          id: cycleId, // Filtrar por cycleId
          trainingWeeks: {
            trainingSessions: {
              dayNumber: dayNumber, // Filtrar por dayNumber
            },
          },
        },
        relations: [
          'trainingWeeks',
          'trainingWeeks.trainingSessions',
          'client',
          'trainingWeeks.trainingSessions.workoutInstances',
          'trainingWeeks.trainingSessions.workoutInstances.workout',
        ],
      });

      // Extraer todos los workouts de las sesiones de entrenamiento
        const allWorkouts = trainingCycles.flatMap(cycle =>
          cycle.trainingWeeks.flatMap(week =>
            week.trainingSessions.flatMap(session =>
              session.workoutInstances.map(workoutInstance => workoutInstance.workout)
            )
          )
        );

        // Utilizar un mapa para obtener workouts únicos
        const uniqueWorkoutsMap = new Map();
        allWorkouts.forEach(workout => {
          if (!uniqueWorkoutsMap.has(workout.id)) {
            uniqueWorkoutsMap.set(workout.id, workout);
          }
        });

        // Convertir el mapa a una lista de workouts únicos
        const uniqueWorkouts = Array.from(uniqueWorkoutsMap.values());

        return uniqueWorkouts;
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async assignWorkout(assignWorkoutDto: AssignWorkoutDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { planId, studentId, expectedStartDate, expectedEndDate, notes, status, instanceName } = assignWorkoutDto;
  
    const workout = await this.workoutRepository.findOne({
      where: { id: planId }
    });
  
    if (!workout) {
      throw new HttpException('Workout not found', HttpStatus.NOT_FOUND);
    }
  
    // Buscar la workoutInstance que es plantilla
    const templateInstance = await this.workoutInstanceRepository.findOne({
      where: { workout: { id: planId }, isTemplate: true },
      relations: ['groups', 'groups.exercises', 'groups.exercises.exercise'],
    });
  
    if (!templateInstance) {
      throw new HttpException('Template workout instance not found', HttpStatus.NOT_FOUND);
    }
  
    // Buscar la suscripción del cliente
    const clientSubscription = await this.clientSubscriptionRepository.findOne({
      where: { id: studentId },
      relations: ['client', 'client.user']
    });
  
    if (!clientSubscription) {
      throw new HttpException('Client Subsctiption not found', HttpStatus.NOT_FOUND);
    }
  
    // Crear una nueva workoutInstance basada en la plantilla
    const newWorkoutInstance = await  queryRunner.manager.create(WorkoutInstance, {
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
      instanceName
    });
  
    const savedWorkoutInstance = await queryRunner.manager.save(WorkoutInstance, newWorkoutInstance);
  
    // Copiar grupos y ejercicios
    for (const group of templateInstance.groups) {
      const newGroup = await queryRunner.manager.create(ExerciseGroup, {
        set: group.set,
        rest: group.rest,
        groupNumber: group.groupNumber,
        workoutInstance: savedWorkoutInstance,
      });
  
      const savedGroup = await queryRunner.manager.save(ExerciseGroup, newGroup);
  
      for (const exercise of group.exercises) {
        const newExercise = await queryRunner.manager.create(ExerciseInstance, {
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
          // exercise: { id: exercise.exercise.id }
        });
        await queryRunner.manager.save(ExerciseInstance, newExercise);
      }
    }
    await this.userService.logActivity(clientSubscription.client.user.id, `New workout (Workout name: ${workout.planName}) plan assigned.`)
    await queryRunner.commitTransaction();
    return savedWorkoutInstance;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }finally{
      await queryRunner.release();
    }
    
  }

  async assignWorkoutToSession(sessionId: number, workoutId: number, clientId: number): Promise<TrainingSession> {
    const queryRunner = this.dataSource.createQueryRunner();
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const session = await this.trainingSessionRepository.findOne({ 
        where: { id: sessionId }, 
        relations: ['workoutInstances'] 
      });
      if (!session) {
        throw new HttpException('Training session not found', HttpStatus.NOT_FOUND);
      }
      const workout = await this.workoutRepository.findOne({
        where: { id: workoutId },
        relations: ['workoutInstances'],
      });
  
      if (!workout) {
        throw new HttpException('Workout not found', HttpStatus.NOT_FOUND);
      }
  
      const templateInstance = workout.workoutInstances.find(instance => instance.isTemplate);
      if (!templateInstance) {
        throw new HttpException('Template workout instance not found', HttpStatus.NOT_FOUND);
      }
  
      const clientSubscription = await this.clientSubscriptionRepository.findOne({
        where: { client: { id: clientId } },
      });
  
      if (!clientSubscription) {
        throw new HttpException('Client subscription not found', HttpStatus.NOT_FOUND);
      }
  
      const newWorkoutInstance = queryRunner.manager.create(WorkoutInstance, {
        instanceName: templateInstance.instanceName,
        personalizedNotes: templateInstance.personalizedNotes,
        dateAssigned: new Date(),
        dateCompleted: null,
        feedback: '',
        isRepeated: false,
        isTemplate: false,
        repeatDays: [],
        expectedStartDate: templateInstance.expectedStartDate,
        expectedEndDate: templateInstance.expectedEndDate,
        realStartedDate: null,
        realEndDate: null,
        sessionTime: templateInstance.sessionTime,
        generalFeedback: templateInstance.generalFeedback,
        energyLevel: templateInstance.energyLevel,
        mood: templateInstance.mood,
        perceivedDifficulty: templateInstance.perceivedDifficulty,
        additionalNotes: templateInstance.additionalNotes,
        workout: workout,
        clientSubscription: clientSubscription,
        trainingSession: session,
        status: 'pending',
      });
      
      const savedWorkoutInstance = await queryRunner.manager.save(WorkoutInstance, newWorkoutInstance);
      if(!savedWorkoutInstance.trainingSession)
        throw new HttpException('Error xd', HttpStatus.INTERNAL_SERVER_ERROR)
      const workoutInstanceReal = await this.workoutInstanceRepository.findOne({
        where: { id: templateInstance.id, isTemplate: true },
        relations: ['groups', 'groups.exercises', 'groups.exercises.exercise']
      });
      if(!workoutInstanceReal)
        throw new HttpException('Workout instance not found', HttpStatus.NOT_FOUND)
      for (const group of workoutInstanceReal.groups) {
        const newGroup = queryRunner.manager.create(ExerciseGroup, {
          groupNumber: group.groupNumber,
          set: group.set,
          rest: group.rest,
          workoutInstance: savedWorkoutInstance,
        });
        const savedGroup = await queryRunner.manager.save(ExerciseGroup, newGroup);
        for (const exercise of group.exercises) {
          const newExercise = queryRunner.manager.create(ExerciseInstance, {
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
            completed: exercise.completed,
            rpe: exercise.rpe,
            comments: exercise.comments,
            exercise: exercise.exercise,
            group: savedGroup,
          });
          
          const exerciseInstanceSaved = await queryRunner.manager.save(ExerciseInstance, newExercise);
        }
      }
      session.workoutInstances.push(savedWorkoutInstance)
      const sessionSaved = await queryRunner.manager.save(TrainingSession, session)
      
      await queryRunner.commitTransaction();
      const fullSession = await this.trainingSessionRepository.findOne({where: { id: sessionSaved.id }, relations: ['workoutInstances', 'workoutInstances.groups', 'workoutInstances.groups.exercises']})
      return fullSession;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  async assignWorkoutsToCycle(cycleId: number, assignWorkoutsToCycleDTO: AssignWorkoutsToCycleDTO, clientId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const cycle = await this.trainingCycleRepository.findOne({
        where: { id: cycleId },
        relations: ['trainingWeeks', 'trainingWeeks.trainingSessions', 'trainingWeeks.trainingSessions.workoutInstances'],
      });
      
      if (!cycle) {
        throw new HttpException('Training cycle not found', HttpStatus.NOT_FOUND);
      }
      
      const clientSubscription = await this.clientSubscriptionRepository.findOne({
        where: { client: { id: clientId } },
      });
  
      if (!clientSubscription) {
        throw new HttpException('Client subscription not found', HttpStatus.NOT_FOUND);
      }

      for (const assignment of assignWorkoutsToCycleDTO.assignments) {
        const workout = await this.workoutRepository.findOne({
          where: { id: assignment.workoutId },
          relations: ['workoutInstances'],
        });

        if (!workout) {
          throw new HttpException('Workout not found', HttpStatus.NOT_FOUND);
        }
  
        const templateInstance = workout.workoutInstances.find(instance => instance.isTemplate);
        if (!templateInstance) {
          throw new HttpException('Template workout instance not found', HttpStatus.NOT_FOUND);
        }
  
        for (const week of cycle.trainingWeeks) {
          if(assignment.dayOfWeek < 1 || assignment.dayOfWeek > 7)
            throw new HttpException('Day of week must be between 1 and 7', HttpStatus.BAD_REQUEST)
          const session = week.trainingSessions.find(session => this.getDayOfWeek(session.sessionDate) === (assignment.dayOfWeek));
          
          if (session) {
            const newWorkoutInstance = queryRunner.manager.create(WorkoutInstance, {
              instanceName: templateInstance.instanceName,
              personalizedNotes: templateInstance.personalizedNotes,
              status: templateInstance.status,
              dateAssigned: new Date(),
              dateCompleted: null,
              feedback: '',
              isRepeated: false,
              isTemplate: false,
              repeatDays: [],
              expectedStartDate: session.sessionDate,
              expectedEndDate: templateInstance.expectedEndDate,
              realStartedDate: null,
              realEndDate: null,
              sessionTime: templateInstance.sessionTime,
              generalFeedback: templateInstance.generalFeedback,
              energyLevel: templateInstance.energyLevel,
              mood: templateInstance.mood,
              perceivedDifficulty: templateInstance.perceivedDifficulty,
              additionalNotes: templateInstance.additionalNotes,
              workout: workout,
              clientSubscription: clientSubscription,
              trainingSession: session,
            });
  
            const savedWorkoutInstance = await queryRunner.manager.save(WorkoutInstance, newWorkoutInstance);
            
            const workoutInstanceReal = await this.workoutInstanceRepository.findOne({
              where: { id: templateInstance.id, isTemplate: true },
              relations: ['groups', 'groups.exercises', 'groups.exercises.exercise']
            });
  
            if (!workoutInstanceReal) {
              throw new HttpException('Workout instance not found', HttpStatus.NOT_FOUND);
            }
  
            for (const group of workoutInstanceReal.groups) {
              const newGroup = queryRunner.manager.create(ExerciseGroup, {
                groupNumber: group.groupNumber,
                set: group.set,
                rest: group.rest,
                workoutInstance: savedWorkoutInstance,
              });
  
              const savedGroup = await queryRunner.manager.save(ExerciseGroup, newGroup);
  
              for (const exercise of group.exercises) {
                const newExercise = queryRunner.manager.create(ExerciseInstance, {
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
                  completed: exercise.completed,
                  rpe: exercise.rpe,
                  comments: exercise.comments,
                  exercise: exercise.exercise,
                  group: savedGroup,
                });
  
                await queryRunner.manager.save(ExerciseInstance, newExercise);
              }
            }
            session.workoutInstances.push(savedWorkoutInstance);
            await queryRunner.manager.save(TrainingSession, session);
          }
        }
      }
      await queryRunner.commitTransaction();
      const fullCycle = await this.trainingCycleRepository.findOne({where: { id: cycleId}})
      return fullCycle;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  getDayOfWeek(date: Date): number {
    // const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    // return days[date.getUTCDay()];
    return date.getUTCDay() === 0 ? 7 : date.getUTCDay();
  }

  async findAllWorkoutsByCoachIdExcludingClientId(
    coachId: number,
    clientId: number,
  ): Promise<Workout[]> {
    try {
       // Paso 1: Obtener la suscripción del cliente
        const clientSubscription = await this.clientSubscriptionRepository
        .createQueryBuilder('clientSubscription')
        .innerJoinAndSelect('clientSubscription.subscription', 'subscription')
        .innerJoinAndSelect('clientSubscription.client', 'client')
        .where('client.id = :clientId', { clientId })
        .getOne();
      if (!clientSubscription) {
        throw new HttpException('Client Subsctiption not found', HttpStatus.NOT_FOUND);
      }

      // Paso 2: Buscar workouts por coachId excluyendo los asociados a la suscripción del cliente
      const subscriptionId = clientSubscription.subscription.id;

      if(!subscriptionId) 
        throw new HttpException('subscriptionId not found', HttpStatus.NOT_FOUND);

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
    } catch (error) {
      throw new HttpException('Error findAllWorkoutsByCoachIdExcludingClientId', HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
  }

  async findAllClientWorkoutsByUserId(userId: number): Promise<any> {
    try {
      const clientWorkouts = await this.workoutRepository
        .createQueryBuilder('workout')
        .leftJoinAndSelect('workout.workoutInstances', 'workoutInstance') // Asume que la relación se llama 'groups' en 'Workout'
        .innerJoin('workoutInstance.clientSubscription', 'clientSubscription')
        .innerJoin('clientSubscription.client', 'client')
        .innerJoin('client.user', 'user')
        .leftJoinAndSelect('workoutInstance.groups', 'group') // Asume que la relación se llama 'groups' en 'Workout'
        .leftJoinAndSelect('group.exercises', 'exerciseInstance') // Correctly aliasing as 'exerciseInstance'
        .leftJoinAndSelect('exerciseInstance.exercise', 'exercise')
        .where('user.id = :userId', { userId })
        // .andWhere('subscription.isDeleted = false') // Si solo quieres las suscripciones activas
        .getMany();

      return clientWorkouts;
    } catch (error) {
      console.error('Error fetching workouts by client ID:', error);
      throw new HttpException('Error fetching workouts by client ID', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async findAllByClientId(clientId: number): Promise<any> {
    try {
      const clientWorkoutInstances = await this.workoutInstanceRepository
        .createQueryBuilder('workoutInstance')
        .leftJoinAndSelect('workoutInstance.workout', 'workout')
        .innerJoin('workoutInstance.clientSubscription', 'clientSubscription')
        .leftJoinAndSelect('workoutInstance.trainingSession', 'trainingSession')
        .leftJoinAndSelect('trainingSession.trainingWeek', 'trainingWeek')
        .leftJoinAndSelect('trainingWeek.trainingCycle', 'trainingCycle')
        .innerJoin('clientSubscription.client', 'client')
        .leftJoinAndSelect('workoutInstance.groups', 'group')
        .leftJoinAndSelect('group.exercises', 'exerciseInstance')
        .leftJoinAndSelect('exerciseInstance.exercise', 'exercise')
        .leftJoinAndSelect('exerciseInstance.setLogs', 'setLog') // Include setLogs

        .where('client.id = :clientId', { clientId })
        .getMany();
  
      return clientWorkoutInstances;
    } catch (error) {
      console.error('Error fetching workout instances by client ID:', error);
      throw new HttpException('Error fetching workout instances by client ID', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findClientWorkoutsByUserId(userId: number): Promise<any> {
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
      throw new HttpException('Error fetching workouts by user ID', HttpStatus.INTERNAL_SERVER_ERROR);
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
      throw new HttpException('Error fetching workouts by coach ID', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async findAllCoachWorkoutsByUserId(userId: number): Promise<any> {
    try {
      const coachWorkouts = await this.workoutRepository
        .createQueryBuilder('workout')
        .innerJoinAndSelect('workout.coach', 'coach')
        .innerJoinAndSelect('coach.user', 'user')
        .leftJoinAndSelect('workout.workoutInstances', 'workoutInstance')
        .leftJoinAndSelect('workoutInstance.groups', 'group')
        .leftJoinAndSelect('group.exercises', 'exerciseInstance')
        .leftJoinAndSelect('exerciseInstance.exercise', 'exercise')
        .where('user.id = :userId', { userId })
        .getMany();
      return coachWorkouts;
    } catch (error) {
      console.error('Error fetching workouts by coach ID:', error);
      throw new HttpException('Error fetching workouts by coach ID', HttpStatus.INTERNAL_SERVER_ERROR);
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
  
      
      return workout;
    } catch (error) {
      console.error('Error fetching workout details:', error);
      throw new HttpException('Error fetching one workout by client Id', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async findOne(workoutId: number) {
    try {
      // Consulta principal de Workout Instance junto con las relaciones necesarias
      const workout = await this.workoutInstanceRepository
        .createQueryBuilder('workoutInstance')
        .leftJoinAndSelect('workoutInstance.workout', 'workout')
        .leftJoinAndSelect('workoutInstance.groups', 'group')
        .leftJoinAndSelect('group.exercises', 'exerciseInstance')
        .leftJoinAndSelect('exerciseInstance.exercise', 'exercise')
        .leftJoinAndSelect('workoutInstance.trainingSession', 'trainingSession')
        .leftJoinAndSelect('trainingSession.trainingWeek', 'trainingWeek')
        .leftJoinAndSelect('trainingWeek.trainingCycle', 'trainingCycle')  // Asegúrate de que esta relación está bien definida en la entidad y la base de datos
        .leftJoinAndSelect('workoutInstance.clientSubscription', 'clientSubscription')
        .leftJoinAndSelect('clientSubscription.client', 'client')
        .leftJoinAndSelect('client.user', 'user')
        .where('workoutInstance.id = :workoutId', { workoutId })
        .getOne();
  
      if (!workout) {
        throw new Error('Workout instance not found');
      }
  
      // Consultar RPE Assignment a nivel de Workout, TrainingCycle y Usuario
      const workoutRpeAssignment = await this.rpeAssignmentRepository.findOne({
        where: { targetType: 'workout', targetId: workoutId },
        relations: ['rpeMethod'],
      });
  
      console.log('workoutRpeAssignment:', workoutRpeAssignment);
      const trainingCycleRpeAssignment = workout.trainingSession?.trainingWeek?.trainingCycle
        ? await this.rpeAssignmentRepository.findOne({
            where: { targetType: 'trainingCycle', targetId: workout.trainingSession.trainingWeek.trainingCycle.id },
            relations: ['rpeMethod'],
          })
        : null;
      
      console.log('trainingCycleRpeAssignment:', trainingCycleRpeAssignment);
      const userRpeAssignment = workout.clientSubscription?.client?.user
        ? await this.rpeAssignmentRepository.findOne({
            where: { targetType: 'user', targetId: workout.clientSubscription.client.user.id },
            relations: ['rpeMethod'],
          })
        : null;
      console.log('userRpeAssignment:', userRpeAssignment);

      // Asignar el RPE correspondiente según las prioridades
      let assignedRpe;
      if (workoutRpeAssignment) {
        assignedRpe = workoutRpeAssignment.rpeMethod.name;
      } else if (trainingCycleRpeAssignment) {
        assignedRpe = trainingCycleRpeAssignment.rpeMethod.name;
      } else if (userRpeAssignment) {
        assignedRpe = userRpeAssignment.rpeMethod.name;
      } else {
        assignedRpe = 'No RPE assigned';
      }
  
      // Agregar el RPE asignado a la respuesta del workout
      return { ...workout, assignedRpe };
    } catch (error) {
      console.error('Error fetching workout details:', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async removeWorkout(instanceId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Fetch the workout instance
      const templateInstance = await this.workoutInstanceRepository.findOne({
        where: { id: instanceId },
        relations: ['workout', 'groups', 'groups.exercises'],
      });

      if (!templateInstance) {
        throw new HttpException('Workout instance not found', HttpStatus.NOT_FOUND);
      }

      if (!templateInstance.isTemplate) {
        throw new HttpException('The provided workout instance is not a template', HttpStatus.BAD_REQUEST);
      }

      const workoutPlanId = templateInstance.workout.id;

      // Check if there are any assigned workout instances
      const assignedInstances = await this.workoutInstanceRepository.find({
        where: { workout: { id: workoutPlanId }, isTemplate: false },
      });

      if (assignedInstances.length > 0) {
        throw new HttpException('Cannot delete workout plan that has assigned instances', HttpStatus.BAD_REQUEST);
      }

      // Delete all workout instances, exercise groups, and exercise instances
      const allInstances = await this.workoutInstanceRepository.find({
        where: { workout: { id: workoutPlanId } },
        relations: ['groups', 'groups.exercises'],
      });

      for (const instance of allInstances) {
        for (const group of instance.groups) {
          for (const exercise of group.exercises) {
            await this.exerciseInstanceRepository.delete(exercise.id);
          }
          await this.exerciseGroupRepository.delete(group.id);
        }
        await this.workoutInstanceRepository.delete(instance.id);
      }

      // Delete the workout planxs
      await this.workoutRepository.delete(workoutPlanId);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
        relations: ['groups', 'groups.exercises', 'trainingSession'],
      });

      if (!workoutInstance) {
        throw new HttpException('Workout instance not found', HttpStatus.NOT_FOUND);
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
      throw new HttpException(`Error removing workout: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  async removeWorkoutsFromCycle(cycleId: number, assignWorkoutsToCycleDTO: AssignWorkoutsToCycleDTO) {
    const queryRunner = this.dataSource.createQueryRunner();
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // Obtener los ciclos de entrenamiento con las relaciones necesarias
      let deleted: DeleteResult = {
        raw: [],
        affected: 0
      };
      const trainingCycle = await this.trainingCycleRepository.findOne({
        where: { id: cycleId },
        relations: [
          'trainingWeeks',
          'trainingWeeks.trainingSessions',
          'trainingWeeks.trainingSessions.workoutInstances',
          'trainingWeeks.trainingSessions.workoutInstances.groups',
          'trainingWeeks.trainingSessions.workoutInstances.groups.exercises',
        ],
      });
  
      if (!trainingCycle) {
        throw new HttpException('Training cycle not found', HttpStatus.NOT_FOUND);
      }
  
      // Filtrar las sesiones de entrenamiento que coinciden con el dayOfWeek y workoutId
      for (const assignment of assignWorkoutsToCycleDTO.assignments) {
        const { workoutId, dayOfWeek } = assignment;
  
        const sessionsToRemove = trainingCycle.trainingWeeks.flatMap((week) =>
          week.trainingSessions.filter(
            (session) =>
              session.dayNumber === dayOfWeek &&
              session.workoutInstances.some(
                (instance) => instance.workout.id === workoutId && !instance.isTemplate && instance.status !== 'completed'
              )
          )
        );

        for (const session of sessionsToRemove) {
          for (const instance of session.workoutInstances) {
            if (instance.workout.id === workoutId && !instance.isTemplate) {
              // Eliminar las instancias de ejercicios
              for (const group of instance.groups) {
                for (const exercise of group.exercises) {
                  await this.exerciseInstanceRepository.delete(exercise.id);
                }
              }
  
              // Eliminar los grupos
              for (const group of instance.groups) {
                await this.exerciseGroupRepository.delete(group.id);
              }
  
              // Eliminar la instancia de workout
              deleted = await this.workoutInstanceRepository.delete(instance.id);
            }
          }
        }
      }
  
      await queryRunner.commitTransaction();
      return deleted
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(`Error removing workouts from cycle: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }
  async getWorkoutInstanceWithFeedback(workoutId: number): Promise<any> {
    const workout = await this.workoutInstanceRepository.findOne({
      where: { id: workoutId },
      relations: ['groups', 'groups.exercises', 'groups.exercises.exercise', 'groups.exercises.setLogs']
    });
  
    if (!workout) {
      throw new HttpException(`WorkoutInstance with ID ${workoutId} not found`, HttpStatus.NOT_FOUND);
    }
    return workout
  }

  async getFeedback(workoutId: number): Promise<any> {
    const workout = await this.workoutInstanceRepository.findOne({ where: { id: workoutId }, relations: ['setLogs', 'groups', 'groups.exercises'] });
    if (!workout) {
      throw new HttpException(`WorkoutInstance with ID ${workoutId} not found`, HttpStatus.NOT_FOUND);
    }

    const feedback = await Promise.all(workout.groups.flatMap(group =>
      group.exercises.map(async (exercise) => {
        const setLogs = await this.exerciseSetLogRepository.find({ where: { workoutInstance: {id: workout.id}, exerciseId: exercise.id } });
        return {
          exerciseId: exercise.id,
          sets: setLogs,
          completed: exercise.completed,
          rating: exercise.rpe,
          comments: exercise.comments,
        };
      })
    ));
      console.log('Session time: ', workout.sessionTime)
    return {
      workoutId: workout.id,
      sessionTime: workout.sessionTime,
      generalFeedback: workout.generalFeedback,
      energyLevel: workout.energyLevel,
      mood: workout.mood,
      perceivedDifficulty: workout.perceivedDifficulty,
      additionalNotes: workout.additionalNotes,
      feedback
    };
  }

  async submitFeedback(workoutId: number, createFeedbackDto: CreateFeedbackDto): Promise<WorkoutInstance> {
  const queryRunner = this.dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const workout = await this.findOne(workoutId)
    if (!workout) {
      throw new HttpException('Workout instance not found', HttpStatus.NOT_FOUND);
    }
    if(workout.status === 'completed')
      throw new HttpException('Workout already completed', HttpStatus.BAD_REQUEST)
    for (const feedback of createFeedbackDto.exerciseFeedbackArray) {
      let exerciseFound = false;
      for (const group of workout.groups) {
        const exercise = group.exercises.find(ex => ex.id == feedback.exerciseId);
        if (exercise) {
          exercise.completed = feedback.completed;
          exercise.completedNotAsPlanned = feedback.completedNotAsPlanned; // Guardar el nuevo campo
          exercise.rpe = feedback.rating;
          exercise.comments = feedback.comments;
          await queryRunner.manager.save(ExerciseInstance, exercise);

          // Guardar los datos de los sets
          for (const [index, set] of feedback.sets.entries()) {
            const setLog = queryRunner.manager.create(ExerciseSetLog, {
              workoutInstance: workout,
              exerciseId: feedback.exerciseId,
              exerciseInstance: { id: feedback.exerciseId },
              setNumber: index + 1,
              ...set,
            });
            await queryRunner.manager.save(ExerciseSetLog, setLog);
          }

          exerciseFound = true;
          break; // Sale del bucle de grupos si se encuentra el ejercicio
        }
      }
      if (!exerciseFound) {
        throw new HttpException(`Exercise instance with id ${feedback.exerciseId} not found`, HttpStatus.NOT_FOUND);
      }
    }
    // Convertir el sessionTime de hh:mm a un objeto Date

    workout.sessionTime = createFeedbackDto.sessionTime;
    workout.generalFeedback = createFeedbackDto.generalFeedback;
    workout.energyLevel = createFeedbackDto.energyLevel;
    workout.mood = createFeedbackDto.mood;
    workout.perceivedDifficulty = createFeedbackDto.perceivedDifficulty;
    workout.additionalNotes = createFeedbackDto.additionalNotes;
    workout.realEndDate = new Date();
    workout.status = 'completed';
    const workoutSaved = await queryRunner.manager.save(WorkoutInstance, workout);

    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.client', 'client')
      .where('user.id = :userId', { userId: createFeedbackDto.userId })
      .getOne();
    if (user) {
      const activity = {
        user: user,
        description: `Completed the workout session ${workout.workout.planName} - Week ${workout.trainingSession.trainingWeek.weekNumber || ''} -  Day ${workout.trainingSession.dayNumber || ''}`,
        timestamp: new Date(),
      }
      const newActivity = queryRunner.manager.create(ClientActivity, activity);
      await queryRunner.manager.save(ClientActivity, newActivity);
    }
    await queryRunner.commitTransaction();
    return workoutSaved;
  } catch (error) {
    console.log(error);
    await queryRunner.rollbackTransaction();
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }finally{
    await queryRunner.release();
  }
}

  async createTrainingCycle(createCycleDto: CreateCycleDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const coach = await this.userService.findCoachByUserId(createCycleDto.coachId);
        if (!coach) {
          throw new HttpException('Coach not found', HttpStatus.NOT_FOUND);
        }

        const client = await this.userService.findClientByClientId(createCycleDto.clientId);
        if (!client) {
          throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
        }

        // Determinar la duración del ciclo
        const startDate = new Date(createCycleDto.startDate);
        let endDate, numberOfWeeks;

        if (createCycleDto.durationInMonths) {
          endDate = new Date(startDate.getFullYear(), startDate.getMonth() + createCycleDto.durationInMonths, startDate.getDate());
          numberOfWeeks = createCycleDto.durationInMonths * 4;  // Suposición de 4 semanas por mes
        } else if (createCycleDto.durationInWeeks) {
          numberOfWeeks = createCycleDto.durationInWeeks;
          endDate = new Date(startDate.getTime() + numberOfWeeks * 7 * 24 * 60 * 60 * 1000);
        } else {
          throw new HttpException('Duration must be specified', HttpStatus.BAD_REQUEST);
        }

        const trainingCycle = queryRunner.manager.create(TrainingCycle, {
          client,
          name: createCycleDto.name,
          coach: coach,
          startDate: startDate,
          endDate: endDate,
        });

        const createdCycle = await queryRunner.manager.save(TrainingCycle, trainingCycle);

        for (let i = 0; i < numberOfWeeks; i++) {
          const weekStartDate = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
          const weekEndDate = new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000); // Asumiendo que cada semana comienza en domingo y termina en sábado

          const trainingWeek = queryRunner.manager.create(TrainingWeek, {
            trainingCycle: createdCycle,
            weekNumber: i + 1,
            startDate: weekStartDate,
            endDate: weekEndDate,
          });

          const savedWeek = await queryRunner.manager.save(TrainingWeek, trainingWeek);

          for (let j = 0; j < 7; j++) {
            const sessionDate = new Date(weekStartDate.getTime() + j * 24 * 60 * 60 * 1000);
            const trainingSession = queryRunner.manager.create(TrainingSession, {
              trainingWeek: savedWeek,
              dayNumber: this.getDayOfWeek(sessionDate),
              sessionDate: sessionDate,
            });
            await queryRunner.manager.save(TrainingSession, trainingSession);
          }
        }

        await queryRunner.commitTransaction();
        const fullCycle = await this.trainingCycleRepository.findOne({where: {id: createdCycle.id}, relations: ['trainingWeeks', 'trainingWeeks.trainingSessions']})
        return fullCycle;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  async importPlanFromImage(image: Express.Multer.File): Promise<CreateWorkoutDto> {
    try {
      // Enviar la imagen directamente a la API de OpenAI
      console.log('Image:', image); 
      const planObject = await this.getPlanFromImage(image);

      // Ajustar la estructura del plan según sea necesario
      const adjustedPlan = this.adjustPlanStructure(planObject);

      return adjustedPlan;
    } catch (error) {
      throw new HttpException(
        `Error al importar el plan desde la imagen: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async getPlanFromImage(image: Express.Multer.File): Promise<any> {
    try {
      // Prepara los mensajes para la API de OpenAI  
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `You are an assistant that extracts workout plans from images and returns them as structured JSON objects. 
              Keep in mind that the format implemented in my database for workouts is as follows:
              {
                workout: {
                  id: '',
                  planName: '',
                  coach: {
                    id: '',
                    user: {
                      id: 'user.userId'
                    }
                  }
                },
                personalizedNotes: '',
                groups: [
                  {
                    set: '', // MUST BE A NUMBER
                    rest: '', // MUST BE A NUMBER. Rest and Reps are not the same. BE CAREFUL.
                    groupNumber: plan.groups.length + 1,
                    exercises: [
                      {
                        id: '',
                        exercise: {
                          id: '',
                          name: ''
                        },
                        // Any of the following fields can be empty so if they are not present in the plan, they will be null in the JSON
                        // If there is a string in the plan, consider to put it in the notes field unless you know where it should go
                        repetitions: '', // Can be found in the plan as reps, reps x sets, reps x sets x weight, etc.
                        sets: '',
                        time: '',
                        weight: '',
                        restInterval: '',
                        tempo: '',
                        notes: '',
                        difficulty: '',
                        duration: '',
                        distance: '', 
                      }
                    ]
                  }
                ]
              };
              ` },
              {
                type: "image_url",
                image_url: {
                  "url": `data:${image.mimetype};base64,${image.buffer.toString('base64')}`,
                },
              }
            ],
          },
        ],
      });

      // Extraer el mensaje del asistente
      const assistantMessage = response.choices[0].message?.content?.trim();
      console.log('Assistant message:', assistantMessage);
      if (!assistantMessage) {
        throw new Error('No response received from OpenAI API.');
      }

      // Extraer y parsear el JSON del mensaje del asistente
      const jsonStartIndex = assistantMessage.indexOf('{');
      const jsonEndIndex = assistantMessage.lastIndexOf('}') + 1;
      const jsonString = assistantMessage.substring(jsonStartIndex, jsonEndIndex);

      try {
        // Parsear el string a JSON
        const planObject = JSON.parse(jsonString);
        console.log('Plan object:', planObject);
        return planObject;  // Devuelve el JSON al frontend para su manipulación
      } catch (error) {
        throw new Error('Failed to parse plan JSON from OpenAI response.');
      }
    } catch (error) {
      throw new Error(`Error processing image with OpenAI API: ${error.message}`);
    }
  }

  private adjustPlanStructure(planObject: any): CreateWorkoutDto {
    // Ajustar el objeto del plan según la estructura que necesites
    const adjustedPlan: any = {
      ...planObject,
      // Aquí puedes agregar cualquier ajuste necesario para que el formato sea compatible
    };

    return adjustedPlan;
  }

  async getRpeMethodsForCoach(userId: number): Promise<RpeMethod[]> {
    return await this.rpeMethodRepository.find({ where: { createdBy: { id: userId } } });
  }

  async getRpeMethodById(rpeMethodId: number): Promise<RpeMethod> {
    return await this.rpeMethodRepository.findOne({ where: { id: rpeMethodId } });
  }

  async createRpeMethod(createRpeDto: CreateRpeDto, userId: number): Promise<RpeMethod> {
    const { name, minValue, maxValue, step, valuesMeta } = createRpeDto;

    const newRpeMethod = this.rpeMethodRepository.create({
      name,
      minValue,
      maxValue,
      step,
      valuesMeta,
      createdBy: { id: userId },
    });

    return await this.rpeMethodRepository.save(newRpeMethod);
  }

  async updateRpeMethod(rpeMethodId: number, updateRpeDto: UpdateRpeDto, userId: number): Promise<RpeMethod> {
    const existingRpeMethod = await this.rpeMethodRepository.findOne({ where: { id: rpeMethodId, createdBy: { id: userId } } });
  
    if (!existingRpeMethod) {
      throw new Error('RPE method not found or not authorized to update.');
    }
  
    const updatedRpeMethod = Object.assign(existingRpeMethod, updateRpeDto);
  
    return await this.rpeMethodRepository.save(updatedRpeMethod);
  }

async deleteRpeMethod(rpeMethodId: number, userId: number): Promise<void> {
  const rpeMethodToDelete = await this.rpeMethodRepository.findOne({ where: { id: rpeMethodId, createdBy: { id: userId } } });

  if (!rpeMethodToDelete) {
    throw new Error('RPE method not found or not authorized to delete.');
  }

  await this.rpeMethodRepository.remove(rpeMethodToDelete);
}

  async assignRpeToTarget(rpeMethodId: number, targetType: string, targetId: number, userId: number): Promise<RpeAssignment> {
    const rpeAssignment = this.rpeAssignmentRepository.create({
      rpeMethod: { id: rpeMethodId },
      targetType,
      targetId,
      assignedBy: { id: userId },
    });
    return await this.rpeAssignmentRepository.save(rpeAssignment);
  }

  async getRpeAssignmentsByTarget(targetType: string, targetId: number): Promise<RpeAssignment[]> {
    return await this.rpeAssignmentRepository.find({ where: { targetType, targetId }, relations: ['rpeMethod'] });
  }

}
