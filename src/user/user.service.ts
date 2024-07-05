import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EUserType, User } from './entities/user.entity';
import { UpdateUserDTO } from './dto/update-user.dto';
import {
  CreateClientDTO,
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
import { Subscription } from '../subscription/entities/subscription.entity'

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
    private subscriptionRepository: Repository<Subscription>
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
    if (!coach) {
      throw new HttpException('Coach not found', HttpStatus.NOT_FOUND);
    }
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
    if (!client) {
      throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
    }
    return client;
  }

  async findClients(): Promise<Client[]> {
    return await this.clientRepository.find({ relations: ['user'] });
  }

  async findCoaches(): Promise<Coach[]> {
    return await this.coachRepository.find({ relations: ['user'] });
  }

  async create(createUserDto: CreateUserDTO): Promise<User> {
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

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  async createCoach(coach: CreateCoachDTO, userId: number): Promise<Coach> {
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
    const newCoach = this.coachRepository.create({
      user,
      estimatedClients: coach.estimatedClients,
      hasGym: coach.hasGym,
      gymLocation: coach.gymLocation,
      name: coach.name,
      trainingType: coach.trainingType,
      bio: coach.bio,
      experience: coach.experience,
    });
    const coachSaved = await this.coachRepository.save(newCoach);

    const subscriptionSaved = await this.subscriptionRepository.create({user: user})

    await this.coachSubscriptionRepository.create({
      subscription: subscriptionSaved,
      coach: coachSaved,
      subscriptionPlan: { id: 1 }
    })

    return coachSaved;
  }

  async createClient(client: CreateClientDTO, userId: number): Promise<Client> {
    // I need to create the same user as a client
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const clientExists = await this.clientRepository.findOne({
      where: { user: { id: user.id } },
    });
    if (clientExists) {
      throw new HttpException('Client already exists', HttpStatus.BAD_REQUEST);
    }

    if (user.userType !== EUserType.CLIENT) {
      throw new HttpException('User type not valid', HttpStatus.BAD_REQUEST);
    }
    const formattedBirthdate = new Date(client.birthdate);
    const newClient = this.clientRepository.create({
      user,
      activityLevel: client.activityLevel,
      birthdate: formattedBirthdate,
      fitnessGoal: client.fitnessGoal,
      height: client.height,
      weight: client.weight,
      gender: client.gender,
    });
    return await this.clientRepository.save(newClient);
  }

  async update(id: number, user: UpdateUserDTO): Promise<void> {
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
    await this.userRepository.save(updatedUser);
  }

  async updatePassword(id: number, hashedPassword: string): Promise<void> {
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
    const savedUSer= await this.userRepository.save(updatedUser);
    console.log('savedUser: ', savedUSer)
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
  }

  async getStudentById(id: number) {
    const student = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.user', 'user')
      .where('client.id = :id', { id })
      .getOne();

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
    const user = await this.userRepository.findOne({where :{ id: userId}});
    if (user) {
      const activity = {
        user: user,
        description: description,
        timestamp: new Date(),
      };
      const newActivity = this.clientActivityRepository.create(activity);
      return await this.clientActivityRepository.save(newActivity);
    } else {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  async verifyUser(email:string){
    const user = await this.userRepository.findOne({where : { email : email }})

    if(!user)
      throw new HttpException('User not found!', HttpStatus.NOT_FOUND)

    const updateUser = {
      ...user,
      isVerified: true
    }

    await this.userRepository.update(user.id, updateUser)
  }

  async findByEmail(email:string): Promise<User>{
    const user = await this.userRepository.findOne({where : { email : email }})

    if(!user)
      throw new HttpException('User not found!', HttpStatus.NOT_FOUND)

    return user;
  }
}
