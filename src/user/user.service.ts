import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EUserType, User } from './entities/user.entity';
import { UpdateUserDTO } from './dto/update-user.dto';
import {
  CreateCoachDTO,
  CreateUserDTO,
} from './dto/create-user.dto';
import { Coach } from './entities/coach.entity';
import { Client } from './entities/client.entity';
import { LoginDto } from './dto/log-in.dto';
import * as bcrypt from 'bcrypt';
import { ClientActivity } from './entities/client-activity.entity';
import { ClientSubscription } from '../subscription/entities/client.subscription.entity';
import { CoachSubscription } from '../subscription/entities/coach.subscription.entity';
import { EStatus, Subscription } from '../subscription/entities/subscription.entity'
import { CreateClientDTO } from './dto/create-client.dto';
import { CoachPlan } from 'src/subscription/entities/coach.plan.entity';
import { DataSource } from 'typeorm';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { UpdateClientDto } from './dto/update-client.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(ClientActivity)
    private clientActivityRepository: Repository<ClientActivity>,
    @InjectRepository(ClientSubscription)
    private clientSubscriptionRepository: Repository<ClientSubscription>,
    @InjectRepository(CoachSubscription)
    private coachSubscriptionRepository: Repository<CoachSubscription>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(CoachPlan)
    private coachPlanRepository: Repository<CoachPlan>,
    private dataSource: DataSource,
    private emailService: EmailService,
    private jwtService: JwtService
    ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findCoachByUserId(userId: number): Promise<Coach> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const coach = await this.coachRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user'],
    });
    return coach;
  }

  async findClient(id: number): Promise<Client> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const client = await this.clientRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user'],
    });
    return client;
  }

  async findClientByClientId(clientId: number): Promise<Client>{
    const client = await this.clientRepository.findOne({
      where: {  id: clientId }
    });
    return client;
  }
  async findUserOfClientByClientID(clientId: number){
    return await this.clientRepository.findOne({ where : { id: clientId }, relations: ['user', 'user.subscription'] });
    // return await this.clientRepository.findOne({ where : { id: clientId }, relations: ['user', 'user.subscription', 'user.subscription.clientSubscription', 'user.subscription.clientSubscription.workoutInstance'] });
  }

  async findClients(): Promise<Client[]> {
    return await this.clientRepository.find({ relations: ['user'] });
  }

  async findCoaches(): Promise<Coach[]> {
    return await this.coachRepository.find({ relations: ['user'] });
  }

  async findCoachPlans(coachId: number) {
    return await this.coachPlanRepository.find({ where : { coach : { user : { id: coachId}}}});
  }

  async findCoachExercises(coachId: number) {
    return await this.coachRepository.find({ where :  { user : { id: coachId } }, relations: ['exercises'] }  );
  }

  async create(createUserDto: CreateUserDTO): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
      const findUser = await this.userRepository.findOne({
        where: { email: createUserDto.email, userType: createUserDto.userType },
      });
      if (findUser) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }
      if (createUserDto.userType !== EUserType.CLIENT && createUserDto.userType !== EUserType.COACH) {
        throw new HttpException('User type not valid', HttpStatus.BAD_REQUEST);
      }

      const newUser = queryRunner.manager.create(User,{
        ...createUserDto,
        password: hashedPassword,
      });

      const userSaved = queryRunner.manager.save(User, newUser);
      await queryRunner.commitTransaction();
      return userSaved;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }finally{
      await queryRunner.release();
    }
    
  }

  async createCoach(coach: CreateCoachDTO, userId: number): Promise<Coach> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const coachExists = await this.coachRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (coachExists) {
      throw new HttpException('Coach already exists', HttpStatus.BAD_REQUEST);
    }

    if (user.userType !== EUserType.COACH) {
      throw new HttpException('User type not valid', HttpStatus.BAD_REQUEST);
    }
    const newCoach = queryRunner.manager.create(Coach,{
      user,
      estimatedClients: coach.estimatedClients,
      hasGym: coach.hasGym,
      gymLocation: coach.gymLocation,
      name: coach.name,
      trainingType: coach.trainingType,
      bio: coach.bio,
      experience: coach.experience,
    });
    const coachSaved = await queryRunner.manager.save(Coach, newCoach);

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await queryRunner.manager.create(Subscription, {
      user: user, 
      status: EStatus.ACTIVE, 
      startDate: new Date(), 
      endDate: endDate
    })
    const subscriptionSaved = await queryRunner.manager.save(Subscription, subscription)
    const coachSubscription = await queryRunner.manager.create(CoachSubscription, {
      subscription: subscriptionSaved,
      coach: coachSaved,
      subscriptionPlan: { id: 1 }
    })
    await queryRunner.manager.save(CoachSubscription, coachSubscription)
    await queryRunner.commitTransaction();
    return coachSaved;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }finally{
      await queryRunner.release();
    }
  }

  async update(id: number, user: UpdateUserDTO): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findUser = await this.userRepository.findOne({
        where: { id },
      });
      if (!findUser) {
        throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
  
      // Crear un nuevo objeto user con el password encriptado
      const updatedUser = {
        ...findUser,
        email: user.email ? user.email : findUser.email,
        password: hashedPassword,
      };
      await queryRunner.manager.save(User, updatedUser);

      await this.logActivity(findUser.id, 'User changed their password.')

      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }finally{
      await queryRunner.release();
    }
    
  }

  async updatePassword(id: number, hashedPassword: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findUser = await this.userRepository.findOne({
        where: { id },
      });
      if (!findUser) {
        throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
      }
      // Crear un nuevo objeto user con el password encriptado
      const updatedUser = {
        ...findUser,
        password: hashedPassword,
      };
      await queryRunner.manager.save(User, updatedUser);
      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(error)
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }finally{
      queryRunner.release();
    }
    
  }

  async remove(id: number): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const coach = await this.coachRepository.findOne({
      where: { user: { id: user.id } },
    });
    if (coach) {
      await this.coachRepository.update(coach.id, { isDeleted: true });
    }
    const client = await this.clientRepository.findOne({
      where: { user: { id: user.id } },
    });
    if (client) {
      await this.clientRepository.update(client.id, { isDeleted: true });
    }
    await this.userRepository.update(id, { isDeleted: true });
    return `User with email ${user.email} deleted`;
  }

  async login(loginDto: LoginDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email, password: loginDto.password },
      });
      if (!user) {
        throw new HttpException(
          'User or password incorrect',
          HttpStatus.NOT_FOUND,
        );
      }
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND)
    }
    
  }

  async getStudentById(id: number) {
    const student = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.user', 'user')
      .where('client.id = :id', { id })
      .getOne();
    console.log(student)
    if (!student) {
      throw new HttpException(
        'User or password incorrect',
        HttpStatus.NOT_FOUND,
      );
    }

    return student;
  }

  async getUserActivities(userId: number): Promise<ClientActivity[]> {
    return this.clientActivityRepository.find({
      where: { user: { id: userId } },
      order: { timestamp: 'DESC' }
    });
  }
  async getUserActivitiesClientId(clientId: number): Promise<ClientActivity[]> {
    const clientSubscription = await this.clientSubscriptionRepository
        .createQueryBuilder('clientSubscription')
        .leftJoinAndSelect('clientSubscription.client', 'client')
        .leftJoinAndSelect('client.user', 'user')
        .where('clientSubscription.id = :clientId', { clientId })
        .getOne();
    // const user = await this.clientSubscriptionRepository.findOne({ where : { id: clientId }})
    if(!clientSubscription)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    return this.clientActivityRepository.find({
      where: { user: { id: clientSubscription.client.user.id } },
      order: { timestamp: 'DESC' }
    });
  }

  async logActivity(userId: number, description: string): Promise<ClientActivity> {
    try {
      const user = await this.userRepository.findOne({where :{ id: userId}});
    if (user) {
      const activity = {
        user: user,
        description: description,
        timestamp: new Date(),
      };
      const newActivity = this.clientActivityRepository.create(activity);
      const activitySaved = await this.clientActivityRepository.save(newActivity);
      return activitySaved;
    } else {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    } catch (error) {
      console.log(error)
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async logActivityOrRollback(userId: number, description: string): Promise<ClientActivity> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.userRepository.findOne({where :{ id: userId}});
    if (user) {
      const activity = {
        user: user,
        description: description,
        timestamp: new Date(),
      };
      const newActivity = queryRunner.manager.create(ClientActivity, activity);
      const activitySaved = await queryRunner.manager.save(ClientActivity, newActivity);
      queryRunner.commitTransaction();
      return activitySaved;
    } else {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    } catch (error) {
      console.log(error)
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    
    } finally{
      queryRunner.release()
    }
    
  }

  async verifyUser(email:string){
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.userRepository.findOne({where : { email : email }})

      if(!user)
        throw new HttpException('User not found!', HttpStatus.NOT_FOUND)

      const updateUser = {
        ...user,
        isVerified: true
      }

      await queryRunner.manager.update(User, user.id, updateUser)
      await queryRunner.commitTransaction();
    } catch (error) {
        console.error('Transaction error:', error);
        await queryRunner.rollbackTransaction();
        throw new HttpException('Error signing up!', HttpStatus.BAD_REQUEST);
    } finally {
        await queryRunner.release();
    }
    
  }

  async findByEmail(email:string): Promise<User>{
    const user = await this.userRepository.findOne({where : { email : email }})
    return user;
  }

  async createStudent(createStudentDto: CreateClientDTO): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { email, name, fitnessGoal, activityLevel, birthdate, gender, height, weight, coachId } = createStudentDto;
      const coach = await this.findCoachByUserId(coachId);
      if(!coach)
        throw new HttpException('Coach not found.', HttpStatus.NOT_FOUND)

      const existUser = await this.findByEmail(email);
      if(existUser)
        throw new HttpException('Already exists an user with that email.', HttpStatus.CONFLICT)
      const hashedPassword = await bcrypt.hash(email, 10);
      const user = await queryRunner.manager.create(User, { email, password: hashedPassword, userType: EUserType.CLIENT, isVerified: false });
      const userSaved = await queryRunner.manager.save(User, user);
      if(!userSaved)
        throw new HttpException('User not created.', HttpStatus.BAD_REQUEST)
      const client = await queryRunner.manager.create(Client, { birthdate, gender, height, weight, name, fitnessGoal: fitnessGoal.join(','), activityLevel, user: userSaved, coach  });
      
      const clientSaved= await queryRunner.manager.save(Client, client);
      const subscription = await queryRunner.manager.create(Subscription, {user: userSaved, status: EStatus.INACTIVE})
      const subscriptionSaved = await queryRunner.manager.save(Subscription, subscription);
      
      try {
        const verificationToken = this.jwtService.sign({ email });
        await this.emailService.sendVerificationEmail(email, verificationToken);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        throw new HttpException('Error sending verification email', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error('Error creating student: ', error);
      await queryRunner.rollbackTransaction()
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }{
      await queryRunner.release();
    }
    
  }

  async updateClient(updateClientDto: UpdateClientDto, clientId: number) {
    const queryRunner = await this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(Client, {id: clientId}, {
        fitnessGoal: updateClientDto.fitnessGoal.join(', '),
        activityLevel: updateClientDto.activityLevel,
        phoneNumber: updateClientDto.phoneNumber
      })
      const client = await this.getStudentById(clientId);
      console.log('USER ACA', client)
      await this.logActivity(client.user.id, 'Profile details updated.')
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(error)
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }finally{
      await queryRunner.release();
    }
  }
  async getAllStudentsByCoach(userId: any) {
    try {
      const students = await this.clientRepository.createQueryBuilder('client')
            .leftJoinAndSelect('client.user', 'user')
            .leftJoinAndSelect('client.coach', 'coach')
            .leftJoinAndSelect('coach.user', 'coachUser')
            .leftJoinAndSelect('user.subscription', 'subscription')
            .leftJoinAndSelect('subscription.clientSubscription', 'clientSubscription')
            .leftJoinAndSelect('clientSubscription.coachPlan', 'coachPlan')
            .where('coachUser.id = :userId', { userId: userId.id })
            .getMany();
        return students;
    } catch (error) {
        console.log(error);
        throw new HttpException('Error getting all students by Coach ID', HttpStatus.NOT_FOUND);
    }
  }

  async removeClient(clientId: number){
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const client = await this.findUserOfClientByClientID(clientId);
      if(!client)
        throw new HttpException('Client could not be found.', HttpStatus.NOT_FOUND)
      const clientDeleted = await queryRunner.manager.delete(Client, {id: clientId})
      if(clientDeleted.affected && clientDeleted.affected == 0)
        throw new HttpException('Client could not be removed.', HttpStatus.NOT_FOUND)
      await queryRunner.manager.delete(Subscription, {user: { id: client.user.id}})
      const userDeleted = await queryRunner.manager.delete(User, {id: client.user.id})
      if(userDeleted.affected && userDeleted.affected == 0 )
        throw new HttpException('User could not be removed.', HttpStatus.NOT_FOUND)
        await queryRunner.commitTransaction();
      return clientDeleted;
    } catch (error) {
      console.log(error)
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST, { cause: error})
    }finally {
      await queryRunner.release();
    }
  }
}
