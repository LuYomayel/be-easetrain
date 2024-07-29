import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EUserType, User } from './entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workout, WorkoutInstance } from '../workout/entities/workout.entity';
import { Exercise, ExerciseInstance } from '../exercise/entities/exercise.entity';
import { ExerciseGroup } from '../exercise/entities/exercise-group.entity';
import { ClientSubscription } from '../subscription/entities/client.subscription.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { Coach, ETrainingType } from './entities/coach.entity';
import { ClientActivity } from './entities/client-activity.entity';
import { TrainingCycle } from '../workout/entities/training-cycle.entity';
import { TrainingWeek } from '../workout/entities/training-week.entity';
import { TrainingSession } from '../workout/entities/training-session.entity';
import { ExerciseSetLog } from '../exercise/entities/exercise-set-log.entity';
import { Client, EActivityLevel, EFitnessGoal } from './entities/client.entity';
import { CoachSubscription } from '../subscription/entities/coach.subscription.entity';
import { CoachPlan } from '../subscription/entities/coach.plan.entity';
import { SubscriptionPlan } from '../subscription/entities/subscription.plan.entity';
import { MealPlan } from '../meal-plan/entities/meal-plan.entity';
import { FoodItem } from '../food-item/entities/food-item.entity';
import { Schedule } from '../schedule/entities/schedule.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Review } from '../review/entities/review.entity';
import { BodyArea } from '../exercise/entities/body-area.entity';
import { ExerciseBodyArea } from '../exercise/entities/exercise-body-area.entity';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { CreateCoachDTO, CreateUserDTO } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from './dto/update-user.dto';

describe('UserService', () => {
  let service: UserService;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let queryRunner: any;
    // Suponemos que estas variables contienen las entidades creadas durante los tests
  let createdUsers = [];
  let createdCoaches = [];
  let createdClients = [];
  let createdUser: User;
  let createdUserClient: User;
  let createdCoach: Coach;
  let createdClient: Client;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            type: 'mysql', // Asumiendo que usas MySQL, ajusta según tu base de datos
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
            synchronize: true, // No recomendado para producción
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
        UserService,
        { provide: EmailService, useValue: {} },
        { provide: JwtService, useValue: {} },
        // Otros servicios o providers que UserService podría necesitar
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    dataSource = module.get<DataSource>(DataSource);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Puedes insertar datos de prueba en la base de datos aquí si es necesario
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
  });

  // Más pruebas...

  it('should create a new coach user successfully', async () => {
    const createUserDTO: CreateUserDTO = {
      email: 'newuser25@example.com',
      password: 'password123',
      userType: EUserType.COACH,
    };
  
    const result = await service.create(createUserDTO);
    createdUser = result;
    createdUsers.push(result);
    expect(result).toBeDefined();
    expect(result.email).toEqual(createUserDTO.email);
  });

  // it('should create a new client user successfully', async () => {
  //   const createUserDTO: CreateUserDTO = {
  //     email: 'clienttest38@example.com',
  //     password: 'password123',
  //     userType: EUserType.CLIENT,
  //   };
  
  //   const result = await service.create(createUserDTO);
  //   createdUserClient = result;
  //   createdUsers.push(result);
  //   expect(result).toBeDefined();
  //   expect(result.email).toEqual(createUserDTO.email);
  // });

  it('should create a new coach successfully', async () => {
    const createCoachDTO: CreateCoachDTO = {
      estimatedClients: 20,
      hasGym: true,
      gymLocation: "123 Fitness St.",
      name: "Coach John",
      trainingType: [ETrainingType.GENERAL_FITNESS],
      bio: "Experienced coach",
      experience: "10 years",
      email: createdUser.email,
      password: createdUser.password,
      userType: EUserType.COACH,
      subscriptionPlan: { id: 1 , name: 'Free Trial', max_clients: 3, price: 0}
    };
  
    const userId = createdUser.id; // Assuming this user has been created and is a valid coach
  
    const result = await service.createCoach(createCoachDTO, userId);
    createdCoach = result;
    createdCoaches.push(result)
    expect(result).toBeDefined();
    expect(result.name).toEqual(createCoachDTO.name);
  });

  it('should update user activities successfully', async () => {
    const userId = createdUser.id; // Assuming this is a valid user ID
    const result = await service.logActivity(userId, 'updateData');
    expect(result).toBeDefined()
    expect(result.description).toEqual('updateData')
  });

  it('should get user activities', async () => {
    const userId = createdUser.id; // Assuming this is a valid user ID
    const result = await service.getUserActivities(userId);
    expect(result).toBeDefined()
    expect(result.length).toEqual(1)
    expect(result[0].description).toEqual('updateData')
  });

  it('should login successfully', async () => {
    const result = await service.login({email: createdUser.email, password: createdUser.password});
    expect(result).toBeDefined()
    expect(result).toEqual(createdUser)
  });

  it('should not login', async () => {
    await expect(service.login({email: 'createdUser.email', password: createdUser.password}))
    .rejects
    .toThrow('User or password incorrect')
  });

  it('should delete a user softly', async () => {
    const userId = createdUser.id; // Assuming this is a valid user ID
  
    const deletionMessage = await service.remove(userId);
    expect(deletionMessage).toContain(`User with email`);
  
    const result = await service.findOne(userId)
    expect(result.isDeleted).toBeTruthy()
  });

  it('should update a users password', async () => {
    const userId = createdUser.id; // Assuming this is a valid user ID
    const hashedPassword = await bcrypt.hash('newpassword321', 10);
    await service.updatePassword(userId, hashedPassword);
    
    const result = await service.findOne(userId)
    expect(result.password).toEqual(hashedPassword)
  });

  it('should not update a users password, wrong user ID', async () => {
    const hashedPassword = await bcrypt.hash('newpassword321', 10);
    await expect(service.updatePassword(9999, hashedPassword))
      .rejects
      .toThrow('User does not exist')
  });

  it('should verify user', async () => {

    await service.verifyUser(createdUser.email);
    
    const result = await service.findOne(createdUser.id)
    expect(result.isVerified).toBeTruthy()
  });

  it('should get user by email', async () => {
    const result = await service.findByEmail(createdUser.email)
    expect(result.email).toEqual(createdUser.email)
    expect(result.id).toEqual(createdUser.id)
    expect(result.userType).toEqual('coach')
  });

  it('should not get user by not existing email', async () => {
    const result = await service.findByEmail('id')
    expect(result).toBeNull()
  });

  it('should create a student successfully', async () => {
    const createStudentDto = {
      email: 'clienttest41@example.com',
      name: 'John Doe',
      fitnessGoal: [EFitnessGoal.WEIGHT_LOSS],
      activityLevel: EActivityLevel.VERY_ACTIVE,
      birthdate: new Date(1990, 1, 1),
      gender: 'male',
      height: 180,
      weight: 80,
      coachId: createdCoach.user.id, // Asegúrate de que este ID corresponda a un entrenador existente
    };
    const result = await service.createStudent(createStudentDto)
    console.log('Result client: ', result)
    createdClient = result
    createdClients.push(result)
    createdUsers.push(result.user)
    
  });
  
  it('should throw an error if the coach does not exist', async () => {
    const createStudentDto = {
      email: 'teststudent@example.com',
      name: 'Jane Doe',
      fitnessGoal: [EFitnessGoal.WEIGHT_LOSS],
      activityLevel: EActivityLevel.MODERATELY_ACTIVE,
      birthdate: new Date(1991, 2, 1),
      gender: 'female',
      height: 170,
      weight: 70,
      coachId: 9999, // ID de un entrenador que no existe
    };
  
    await expect(service.createStudent(createStudentDto)).rejects.toThrow('User not found');
  });
  
  afterAll(async () => {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // Eliminar clientes primero
      for (const client of createdClients) {
        await queryRunner.manager.delete(ClientSubscription, { client: { id: client.id } });
        await queryRunner.manager.delete(Subscription, { user: { id: client.user.id } });
        await queryRunner.manager.delete(Client, { id: client.id });
        await queryRunner.manager.delete(User, { id: client.user.id });
      }
  
      // Ahora eliminar coaches
      for (const coach of createdCoaches) {
        // Asegurarse de que no haya clientes referenciando a este coach
        await queryRunner.manager.delete(Client, { coach: { id: coach.id } });
        await queryRunner.manager.delete(ClientActivity, { user: { id: coach.user.id } });
        await queryRunner.manager.delete(CoachSubscription, { coach: { id: coach.id } });
        await queryRunner.manager.delete(Subscription, { user: { id: coach.user.id } });
        await queryRunner.manager.delete(Coach, { id: coach.id });
        await queryRunner.manager.delete(User, { id: coach.user.id });
      }
  
      // Eliminar usuarios restantes si es necesario
      for (const user of createdUsers) {
        await queryRunner.manager.delete(ClientActivity, { user: { id: user.id } });
        await queryRunner.manager.delete(User, { id: user.id });
      }
  
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error('Failed to clean up test-specific data:', error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      await dataSource.destroy(); // Cerrar la conexión a la base de datos
    }
  });
});