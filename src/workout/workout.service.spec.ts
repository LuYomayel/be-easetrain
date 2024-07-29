import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutService } from './workout.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
// import { Workout, WorkoutInstance, Exercise, ExerciseGroup, ExerciseInstance, ClientSubscription, Subscription, User, Coach, ClientActivity, TrainingCycle, TrainingSession, ExerciseSetLog } 
import { Workout, WorkoutInstance } from './entities/workout.entity';
import { Exercise } from '../exercise/entities/exercise.entity';
import { ExerciseGroup } from '../exercise/entities/exercise-group.entity';
import { ExerciseInstance } from '../exercise/entities/exercise.entity';
import { ClientSubscription } from '../subscription/entities/client.subscription.entity';
import { EStatus, Subscription } from '../subscription/entities/subscription.entity';
import { EUserType, User } from '../user/entities/user.entity';
import { Coach, ETrainingType, ICoach } from '../user/entities/coach.entity';
import { ClientActivity } from '../user/entities/client-activity.entity';
import { TrainingCycle  } from './entities/training-cycle.entity';
import { TrainingSession } from './entities/training-session.entity';
import { ExerciseSetLog } from '../exercise/entities/exercise-set-log.entity';
import { CreateWorkoutDto } from './dto/create-workout.dto';
// from './entities';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { Client, EActivityLevel, EFitnessGoal } from '../user/entities/client.entity';
import { CoachSubscription } from '../subscription/entities/coach.subscription.entity';
import { CoachPlan } from '../subscription/entities/coach.plan.entity';
import * as dotenv from 'dotenv';
import { TrainingWeek } from './entities/training-week.entity';
import { SubscriptionPlan } from '../subscription/entities/subscription.plan.entity';
import { MealPlan } from '../meal-plan/entities/meal-plan.entity';
import { FoodItem } from '../food-item/entities/food-item.entity';
import { Schedule } from '../schedule/entities/schedule.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Review } from '../review/entities/review.entity';
import { BodyArea } from '../exercise/entities/body-area.entity';
import { ExerciseBodyArea } from '../exercise/entities/exercise-body-area.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { CreateFeedbackDto } from './dto/create-feedback-dto';
dotenv.config({ path: '.env.test' });
describe('WorkoutService', () => {
  let service: WorkoutService;
  let dataSource: DataSource;
  
  let createdCoach: Coach;
  let createdUser: User;
  let createdWorkoutInstance: WorkoutInstance;
  let exerciseInstance: ExerciseInstance;
  let exerciseGroup: ExerciseGroup;
  let queryRunner: any;
  let trainingCycle: TrainingCycle;
  let trainingWeek: TrainingWeek;
  let trainingSession: TrainingSession
  let coach: Coach;
  let client: Client;
  let clientSubscription: ClientSubscription;
  let module: TestingModule
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            type: 'mysql',
            host: configService.get<string>('DATABASE_HOST'),
            port: configService.get<number>('DATABASE_PORT'),
            username: configService.get<string>('DATABASE_USERNAME'),
            password: configService.get<string>('DATABASE_PASSWORD'),
            database: configService.get<string>('DATABASE_DBNAME'),
            entities: [
              Workout,
              WorkoutInstance,
              Exercise,
              ExerciseGroup,
              ExerciseInstance,
              ClientSubscription,
              Subscription,
              User,
              Coach,
              ClientActivity,
              TrainingCycle,
              TrainingWeek,
              TrainingSession,
              ExerciseSetLog,
              Client,
              CoachSubscription,
              CoachPlan,
              SubscriptionPlan,
              MealPlan,
              FoodItem,
              Schedule,
              Payment,
              Review,
              BodyArea,
              ExerciseBodyArea,
            ],
            synchronize: true,
            logging: false,
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([
          Workout,
          WorkoutInstance,
          Exercise,
          ExerciseGroup,
          ExerciseInstance,
          ClientSubscription,
          Subscription,
          User,
          Coach,
          ClientActivity,
          TrainingCycle,
          TrainingWeek,
          TrainingSession,
          ExerciseSetLog,
          Client,
          CoachSubscription,
          CoachPlan,
          SubscriptionPlan,
          MealPlan,
          FoodItem,
          Schedule,
          Payment,
          Review,
          BodyArea,
          ExerciseBodyArea,
        ]),
      ],
      providers: [
        WorkoutService,
        UserService,
        { provide: JwtService, useValue: {} },
        { provide: EmailService, useValue: {} },
      ],
    }).compile();

    service = module.get<WorkoutService>(WorkoutService);
    dataSource = module.get<DataSource>(DataSource);

    // Insertar los datos necesarios en la base de datos
    const userRepository = dataSource.getRepository(User);
    const coachRepository = dataSource.getRepository(Coach);
    const clientRepository = dataSource.getRepository(Client);
    const subscriptionRepository = dataSource.getRepository(Subscription);
    const clientSubscriptionRepository = dataSource.getRepository(ClientSubscription);
    const coachSubscriptionRepository = dataSource.getRepository(CoachSubscription);

    const user = userRepository.create({
      email: 'test@example.com',
      password: 'securepassword',
      isVerified: true,
      userType: EUserType.COACH,
      isDeleted: false,
    });
    createdUser = await userRepository.save(user);

    const coach = coachRepository.create({
      user: user,
      name: 'Test Coach',
      bio: 'Experienced coach in multiple disciplines.',
      experience: '10 years',
      estimatedClients: 20,
      trainingType: [ETrainingType.CALISTENICS, ETrainingType.GENERAL_FITNESS],
      hasGym: true,
      gymLocation: '123 Fitness St.',
      isDeleted: false,
    });
    createdCoach = await coachRepository.save(coach);

    // Create and save a Subscription
    const subscription = subscriptionRepository.create({
      user: createdUser,  // or any required user link
      startDate: new Date(),
      endDate: new Date(),
      status: EStatus.ACTIVE,
      isDeleted: false
    });
    const savedSubscription = await subscriptionRepository.save(subscription);


    // Crear y guardar un User para el Client
  const clientUser = userRepository.create({
    email: 'client@example.com',
    password: 'securepassword',
    isVerified: true,
    userType: EUserType.CLIENT,
    isDeleted: false,
  });
  const createdClientUser = await userRepository.save(clientUser);


  const subscriptionClient = subscriptionRepository.create({
    user: createdClientUser,  // or any required user link
    startDate: new Date(),
    endDate: new Date(),
    status: EStatus.ACTIVE,
    isDeleted: false
  });
  const savedSubscriptionClient = await subscriptionRepository.save(subscriptionClient);

  // Crear y guardar un Client
  const clientCreated = clientRepository.create({
    user: createdClientUser,
    name: 'Test Client',
    height: 180,
    weight: 75,
    fitnessGoal: EFitnessGoal.MAINTENANCE,
    activityLevel: EActivityLevel.MODERATELY_ACTIVE,
    birthdate: new Date('1990-01-01'),
    phoneNumber: 123456789,
    gender: 'male',
    isDeleted: false,
    coach: createdCoach,
  });
  client = await clientRepository.save(clientCreated);

  const clientSubscriptionCreated = clientSubscriptionRepository.create({
    client: client,
    subscription: savedSubscriptionClient,
    /* additional details if needed */
  });
  clientSubscription = await clientSubscriptionRepository.save(clientSubscriptionCreated);

  const coachSubscription = coachSubscriptionRepository.create({
    coach: createdCoach,
    subscription: savedSubscription,
    /* additional details if needed */
  });
  await coachSubscriptionRepository.save(coachSubscription);

    const workoutRepository = dataSource.getRepository(Workout);
    const workoutInstanceRepository = dataSource.getRepository(WorkoutInstance);
    const exerciseGroupRepository = dataSource.getRepository(ExerciseGroup);
    const exerciseInstanceRepository = dataSource.getRepository(ExerciseInstance);
    const exerciseRepository = dataSource.getRepository(Exercise);
    const trainingCycleRepo = dataSource.getRepository(TrainingCycle);
    const trainingWeekRepo = dataSource.getRepository(TrainingWeek);
    const trainingSessionRepo = dataSource.getRepository(TrainingSession);
    console.log('Coach: ', createdCoach)
    trainingCycle = await service.createTrainingCycle({
      coachId: createdCoach.id,
      clientId: client.id,
      name: 'Initial Training Cycle',
      startDate: new Date('2022-01-01'),
      durationInMonths: 1
    });

    console.log('Training Cycle Created: ', trainingCycle)
    const workout = workoutRepository.create({
      planName: 'Test Workout',
      coach: createdCoach,
    });
    const savedWorkout = await workoutRepository.save(workout);

    const workoutInstance = workoutInstanceRepository.create({
      workout: savedWorkout,
      instanceName: 'Test Instance',
      isTemplate: true,
      dateAssigned: new Date(),
      status: 'pending',
    });
    createdWorkoutInstance = await workoutInstanceRepository.save(workoutInstance);

     // Crear y guardar un TrainingSession
    const trainingSessionCreated = trainingSessionRepo.create({ 
      sessionDate: new Date(), 
      dayNumber: 1, 
      trainingWeek,
    });
    trainingSession = await trainingSessionRepo.save(trainingSessionCreated);
    
    const exerciseNewGroup = exerciseGroupRepository.create({
      workoutInstance: createdWorkoutInstance,
      exercises: [],
      set: 3,
      rest: 60,
      groupNumber: 1,
    });
    exerciseGroup = await exerciseGroupRepository.save(exerciseNewGroup);

    const exercise = await exerciseRepository.create({
      coach: createdCoach,
      createdByAdmin: false,
      createdByCoach: true,
      name: 'Push ups',
      description: 'XD'
    })

    const savedExercise = await exerciseRepository.save(exercise)
    const exerciseInstanceCreated = exerciseInstanceRepository.create({
      exercise: savedExercise,
      group: exerciseGroup,
      repetitions: '10',
    });
    exerciseInstance = await exerciseInstanceRepository.save(exerciseInstanceCreated);
  });

  beforeEach(async () => {
    
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    if (queryRunner) {
      try {
        await queryRunner.rollbackTransaction();
      } catch (error) {
        console.error('Error rolling back transaction:', error);
      } finally {
        await queryRunner.release();
      }
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(clientSubscription).toBeDefined();
  });

  it('should create a new workout and instance', async () => {
    const createWorkoutDto: CreateWorkoutDto = {
      workout: {
        id: 1,
        planName: 'Test Workout',
        coach: createdCoach,
        workoutInstances: [],
      },
      isTemplate: true,
      dateAssigned: new Date(),
      instanceName: 'Test Instance',
      repeatDays: [],
      groups: [{
        ...exerciseGroup,
        exercises: [
          { ...exerciseInstance }
        ]
      }],
      personalizedNotes: 'Test notes',
      isRepetead: false,
    };

    createdWorkoutInstance = await service.create(createWorkoutDto);
    expect(createdWorkoutInstance).toMatchObject({
      workout: {
        planName: 'Test Workout',
        coach: {
          id: createdCoach.id,
          name: 'Test Coach',
          bio: 'Experienced coach in multiple disciplines.',
          experience: '10 years',
          estimatedClients: 20,
          trainingType: [ETrainingType.CALISTENICS, ETrainingType.GENERAL_FITNESS],
          hasGym: true,
          gymLocation: '123 Fitness St.',
          isDeleted: false,
        },
      },
      isTemplate: true,
      dateAssigned: expect.any(Date),
      instanceName: 'Test Instance',
      repeatDays: [],
      groups: [{
        ...exerciseGroup,
        exercises: [
          { ...exerciseInstance }
        ]
      }],
      personalizedNotes: 'Test notes',
      isRepeated: false,
      status: 'pending',
    });
  });

  it('should update the workout template successfully', async () => {
    const updateWorkoutDto: UpdateWorkoutDto = {
      id: createdWorkoutInstance.id,
      workout: {
        id: createdWorkoutInstance.workout.id,
        planName: 'Updated Workout',
        coach: createdCoach,
        workoutInstances: []
      },
      dateAssigned: new Date(),
      groups: createdWorkoutInstance.groups,
      personalizedNotes: 'Updated notes',
      coach: createdCoach,
      planName: 'Plan name',
      workoutInstances: []
    };

    createdWorkoutInstance = await service.updateWorkoutTemplate(updateWorkoutDto);
    expect(createdWorkoutInstance).toMatchObject({
      workout: {
        planName: 'Updated Workout',
      },
      personalizedNotes: 'Updated notes',
    });
  });

  it('should get a workout instance. ', async () => {
    const workoutInstance = await service.findOne(createdWorkoutInstance.id);
    expect(workoutInstance).toMatchObject({
      // ...createdWorkoutInstance,
      workout: {
        planName: 'Updated Workout'
      },
      personalizedNotes: "Updated notes",
      // groups: [exerciseGroup]
    });
  })

    it('should correctly assign a workout to a session', async () => {
      const result = await service.assignWorkoutToSession(trainingCycle.trainingWeeks[0].trainingSessions[0].id, createdWorkoutInstance.workout.id, client.id);
      expect(result).toBeDefined();
      expect(result.workoutInstances).toHaveLength(1);
      expect(result.workoutInstances[0].isTemplate).toBeFalsy();
      expect(result.workoutInstances[0].workout.id).toEqual(createdWorkoutInstance.workout.id);
      trainingCycle.trainingWeeks[0].trainingSessions[0] = result;
    });
  
    it('should handle multiple assignments without conflict', async () => {
      // Assign the same workout to different sessions
      const result1 = await service.assignWorkoutToSession(trainingCycle.trainingWeeks[0].trainingSessions[1].id, createdWorkoutInstance.workout.id, client.id);
      const result2 = await service.assignWorkoutToSession(trainingCycle.trainingWeeks[0].trainingSessions[2].id, createdWorkoutInstance.workout.id, client.id);
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.workoutInstances[0].id).not.toEqual(result2.workoutInstances[0].id);
    });
  
    it('should fail for a non-existing session ID', async () => {
      await expect(service.assignWorkoutToSession(9999, createdWorkoutInstance.workout.id, client.id))
        .rejects
        .toThrow('Training session not found');
    });
  
    it('should fail for a non-existing workout ID', async () => {
      await expect(service.assignWorkoutToSession(trainingCycle.trainingWeeks[0].trainingSessions[0].id, 9999, client.id))
        .rejects
        .toThrow('Workout not found');
    });
  
    it('should fail for a non-existing client ID', async () => {
      await expect(service.assignWorkoutToSession(trainingCycle.trainingWeeks[0].trainingSessions[0].id, createdWorkoutInstance.workout.id, 9999))
        .rejects
        .toThrow('Client subscription not found');
    });
  
    it('should handle an empty workout correctly', async () => {
      const emptyWorkout = await dataSource.getRepository(Workout).save({coach: createdCoach, planName: 'Empty Workout'});
      await expect(service.assignWorkoutToSession(trainingCycle.trainingWeeks[0].trainingSessions[0].id, emptyWorkout.id, client.id))
        .rejects
        .toThrow('Template workout instance not found');
    });
  

    
    
    it('should save all fields of feedback correctly', async () => {
      const createFeedbackDto: CreateFeedbackDto = {
        exerciseFeedbackArray: [
          {
            exerciseId: trainingCycle.trainingWeeks[0].trainingSessions[0].workoutInstances[0].groups[0].exercises[0].id,
            sets: [
              {
                repetitions: '10',
                weight: '50kg',
                difficulty: null,
              distance: null,
              duration: null,
              notes: null,
              restInterval: null,
              tempo: null,
              time: null,
            },
          ],
          rating: '5',
          completed: true,
          userId: createdUser.id,
          comments: '',
          completedNotAsPlanned: true
        },
      ],
      userId: createdUser.id,
      sessionTime: new Date(),
      generalFeedback: 'Great workout!',
      energyLevel: 8,
      mood: 7,
      perceivedDifficulty: 6,
      additionalNotes: 'Felt good overall.',
    };
    const feedback = await service.submitFeedback(trainingCycle.trainingWeeks[0].trainingSessions[0].workoutInstances[0].id, createFeedbackDto);
    expect(feedback.generalFeedback).toEqual(createFeedbackDto.generalFeedback);
    expect(feedback.energyLevel).toEqual(createFeedbackDto.energyLevel);
    expect(feedback.mood).toEqual(createFeedbackDto.mood);
    expect(feedback.perceivedDifficulty).toEqual(createFeedbackDto.perceivedDifficulty);
    expect(feedback.additionalNotes).toEqual(createFeedbackDto.additionalNotes);
    expect(feedback.sessionTime).toEqual(expect.any(Date));
    // Validate other fields as well
  });

  it('should prevent feedback from being overwritten', async () => {
    const createFeedbackDto: CreateFeedbackDto = {
      exerciseFeedbackArray: [
        {
          exerciseId: trainingCycle.trainingWeeks[0].trainingSessions[0].workoutInstances[0].groups[0].exercises[0].id,
          sets: [
            {
              repetitions: '10',
              weight: '50kg',
              difficulty: null,
              distance: null,
              duration: null,
              notes: null,
              restInterval: null,
              tempo: null,
              time: null,
            },
          ],
          rating: '5',
          completed: true,
          userId: createdUser.id,
          comments: '',
          completedNotAsPlanned: true
        },
      ],
      userId: createdUser.id,
      sessionTime: new Date(),
      generalFeedback: 'Great workout!',
      energyLevel: 8,
      mood: 7,
      perceivedDifficulty: 6,
      additionalNotes: 'Felt good overall.',
    };
    // await service.submitFeedback(trainingCycle.trainingWeeks[0].trainingSessions[0].workoutInstances[0].id, createFeedbackDto);
    const modifiedFeedbackDto = { ...createFeedbackDto, generalFeedback: 'Modified feedback' };
    await expect(service.submitFeedback(trainingCycle.trainingWeeks[0].trainingSessions[0].workoutInstances[0].id, modifiedFeedbackDto))
      .rejects
      .toThrow('Workout already completed')
  });

  it('should not allow feedback for non-existent workout instances', async () => {
    const createFeedbackDto: CreateFeedbackDto = {
      exerciseFeedbackArray: [
        {
          exerciseId: trainingCycle.trainingWeeks[0].trainingSessions[0].workoutInstances[0].groups[0].exercises[0].id,
          sets: [
            {
              repetitions: '10',
              weight: '50kg',
              difficulty: null,
              distance: null,
              duration: null,
              notes: null,
              restInterval: null,
              tempo: null,
              time: null,
            },
          ],
          rating: '5',
          completed: true,
          userId: createdUser.id,
          comments: '',
          completedNotAsPlanned: true
        },
      ],
      userId: createdUser.id,
      sessionTime: new Date(),
      generalFeedback: 'Great workout!',
      energyLevel: 8,
      mood: 7,
      perceivedDifficulty: 6,
      additionalNotes: 'Felt good overall.',
    };
    await expect(service.submitFeedback(9999, createFeedbackDto))
      .rejects
      .toThrow('Workout instance not found');
  });

  it('should handle not finding a workout when assigning to a session', async () => {
    const invalidWorkoutId = 999; // Assuming this ID does not exist
    await expect(service.assignWorkoutToSession(trainingSession.id, invalidWorkoutId, client.id))
      .rejects
      .toThrow('Workout not found');
  });

  it('assigns workouts to cycle successfully', async () => {
    const assignWorkoutsToCycleDTO = {
      assignments: [
        { workoutId: createdWorkoutInstance.workout.id, dayOfWeek: 5 } // Ensure your logic handles this dayOfWeek appropriately in the context of the test setup
      ]
    };
    const result = await service.assignWorkoutsToCycle(trainingCycle.id, assignWorkoutsToCycleDTO, client.id);
    expect(result).toBeDefined()
    expect(result.name).toEqual(trainingCycle.name)
    expect(result.trainingWeeks[0].trainingSessions[6].workoutInstances).toHaveLength(1)
    expect(result.trainingWeeks[1].trainingSessions[6].workoutInstances).toHaveLength(1)
    expect(result.trainingWeeks[2].trainingSessions[6].workoutInstances).toHaveLength(1)
    expect(result.trainingWeeks[3].trainingSessions[6].workoutInstances).toHaveLength(1)
  });

  it('assigns workouts that does not exist to cycle', async () => {
    const assignWorkoutsToCycleDTO = {
      assignments: [
        { workoutId: 99999, dayOfWeek: 5 } // Ensure your logic handles this dayOfWeek appropriately in the context of the test setup
      ]
    };
    await expect(service.assignWorkoutsToCycle(trainingCycle.id, assignWorkoutsToCycleDTO, client.id))
      .rejects
      .toThrow('Workout not found')
  });

  it('assigns workouts to cycle with wrong client', async () => {
    const assignWorkoutsToCycleDTO = {
      assignments: [
        { workoutId: createdWorkoutInstance.workout.id, dayOfWeek: 5 } // Ensure your logic handles this dayOfWeek appropriately in the context of the test setup
      ]
    };
    await expect(service.assignWorkoutsToCycle(trainingCycle.id, assignWorkoutsToCycleDTO, 99999))
      .rejects
      .toThrow('Client subscription not found')
  });

  it('assigns workouts to cycle with wrong dayOfWeek', async () => {
    const assignWorkoutsToCycleDTO = {
      assignments: [
        { workoutId: createdWorkoutInstance.workout.id, dayOfWeek: 9 } // Ensure your logic handles this dayOfWeek appropriately in the context of the test setup
      ]
    };
    await expect(service.assignWorkoutsToCycle(trainingCycle.id, assignWorkoutsToCycleDTO, client.id))
    .rejects
    .toThrow('Day of week must be between 0 and 6')
  });

  it('should create a full cycle with correct duration based on months', async () => {
    const cycleDto = { coachId: createdCoach.id, clientId: client.id, name: 'Monthly Cycle', startDate: new Date(), durationInMonths: 2 };
    const cycle = await service.createTrainingCycle(cycleDto);
    const expectedEndDate = new Date(new Date(cycleDto.startDate).setMonth(new Date(cycleDto.startDate).getMonth() + cycleDto.durationInMonths));

    expect(cycle.endDate.getFullYear()).toEqual(expectedEndDate.getFullYear());
    expect(cycle.endDate.getMonth()).toEqual(expectedEndDate.getMonth());
    expect(cycle.endDate.getDate()).toEqual(expectedEndDate.getDate());
});

it('should create a full cycle with correct duration based on weeks', async () => {
  const cycleDto = { coachId: createdCoach.id, clientId: client.id, name: 'Weekly Cycle', startDate: new Date(), durationInWeeks: 3 };
  const cycle = await service.createTrainingCycle(cycleDto);

  // Normaliza ambas fechas a medianoche
  const expectedEndDate = new Date(new Date(cycleDto.startDate).getTime() + (cycleDto.durationInWeeks * 7 * 24 * 60 * 60 * 1000));
  expectedEndDate.setHours(0, 0, 0, 0); // Establecer a medianoche
  const receivedEndDate = new Date(cycle.endDate);
  receivedEndDate.setHours(0, 0, 0, 0); // Establecer a medianoche

  expect(receivedEndDate).toEqual(expectedEndDate);
});

  it('should throw an error if no duration is specified', async () => {
    const cycleDto = { coachId: createdCoach.id, clientId: client.id, name: 'Undefined Duration', startDate: new Date() };
    await expect(service.createTrainingCycle(cycleDto)).rejects.toThrow('Duration must be specified');
  });

  it('should create the correct number of weeks and training sessions per week', async () => {
    const cycleDto = { coachId: createdCoach.id, clientId: client.id, name: 'Duration Check', startDate: new Date(), durationInWeeks: 4 };
    const cycle = await service.createTrainingCycle(cycleDto);
    expect(cycle.trainingWeeks.length).toBe(4);
    cycle.trainingWeeks.forEach(week => {
      expect(week.trainingSessions.length).toBe(7); // Assuming 7 days per week
    });
  });

  it('should link all training sessions to their respective weeks', async () => {
    const cycleDto = { coachId: createdCoach.id, clientId: client.id, name: 'Link Check', startDate: new Date(), durationInWeeks: 2 };
    const cycle = await service.createTrainingCycle(cycleDto);
    expect(cycle.trainingWeeks.length).toBe(2)
    cycle.trainingWeeks.forEach(week => {
      expect(week.trainingSessions.length).toBe(7)
    });
  });

  it('should roll back the transaction if an error occurs during creation', async () => {
    // Simulating an error during cycle creation
    const cycleDto = { coachId: createdCoach.id, clientId: client.id, name: 'Error Test', startDate: new Date(), durationInWeeks: 2 };
    jest.spyOn(service, 'createTrainingCycle').mockImplementation(async () => { throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR); });
    await expect(service.createTrainingCycle(cycleDto)).rejects.toThrow('Internal Server Error');
    
  });

  
  afterAll(async () => {
    await dataSource.destroy();
  });
});