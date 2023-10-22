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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findCoach(id: number): Promise<Coach> {
    const user = await this.userRepository.findOne({
      where: { id },
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

  async create(user: CreateUserDTO): Promise<User> {
    const newUser = await this.userRepository.findOne({
      where: { email: user.email, userType: user.userType },
    });
    if (newUser) {
      console.log(newUser);
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    if (user.userType !== 'client' && user.userType !== 'coach') {
      throw new HttpException('User type not valid', HttpStatus.BAD_REQUEST);
    }

    return await this.userRepository.save(user);
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
    });
    return await this.coachRepository.save(newCoach);
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
    await this.userRepository.update(id, user);
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
}
