import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EStatus, Subscription } from './entities/subscription.entity';
import {
  CreateSubscriptionDTO,
  CreateCoachSubscriptionDTO,
  CreateCoachPlanDTO,
  CreateClientSubscriptionDTO,
} from './dto/create-suscription.dto';
import { CoachSubscription } from './entities/coach.subscription.entity';

import { ClientSubscription } from './entities/client.subscription.entity';
import { UserService } from '../user/user.service';
import { CoachPlan } from './entities/coach.plan.entity';
import { DataSource } from 'typeorm';
import { UpdateSubscriptionDTO } from './dto/update-suscription.dto';
import { SubscriptionPlan } from './entities/subscription.plan.entity';
// import { UpdateSubscriptionDTO } from './dto/update-suscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(CoachSubscription)
    private coachSubscriptionRepository: Repository<CoachSubscription>,
    @InjectRepository(ClientSubscription)
    private clientSubscriptionRepository: Repository<ClientSubscription>,
    // I need to use the services of the user module
    private userService: UserService,
    @InjectRepository(CoachPlan)
    private coachPlanRepository: Repository<CoachPlan>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    private dataSource: DataSource
  ) {}

  async create(
    createSubscriptionDTO: CreateSubscriptionDTO,
  ): Promise<Subscription> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.userService.findOne(createSubscriptionDTO.userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      const newSubscription = await queryRunner.manager.create(Subscription, {
        user,
      });
      const savedSubscription = queryRunner.manager.save(Subscription, newSubscription)
      await queryRunner.commitTransaction();
      return savedSubscription;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }finally{
      await queryRunner.release();
    }
  }

  async createCoachPlan(
    createCoachPlanDTO: CreateCoachPlanDTO,
  ): Promise<CoachPlan> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const coach = await this.userService.findCoachByUserId(createCoachPlanDTO.coachId);
      if (!coach) {
        throw new HttpException('Coach not found', HttpStatus.NOT_FOUND);
      }
      const newCoachSubscription = queryRunner.manager.create(CoachPlan,{
        coach,
        price: createCoachPlanDTO.price,
        name: createCoachPlanDTO.name,
        workoutsPerWeek: createCoachPlanDTO.workoutsPerWeek,
        includeMealPlan: createCoachPlanDTO.includeMealPlan,
      });
      const coachPlanSaved= await queryRunner.manager.save(CoachPlan, newCoachSubscription);
      await queryRunner.commitTransaction();
      return coachPlanSaved;
    } catch (error) {
      console.log(error);
      await  queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }finally{
      await queryRunner.release();
    }
    
  }

  async updateCoachPlan(
    coachPlanId:number,
    createCoachPlanDTO: CreateCoachPlanDTO,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const coachPlan = await this.coachPlanRepository.findOne({where: { id: coachPlanId}})
      if(!coachPlan)
        throw new HttpException('Coach plan not found', HttpStatus.NOT_FOUND)
      const newCoachSubscription = queryRunner.manager.update(CoachPlan, {id: coachPlanId} ,{
        price: createCoachPlanDTO.price,
        name: createCoachPlanDTO.name,
        workoutsPerWeek: createCoachPlanDTO.workoutsPerWeek,
        includeMealPlan: createCoachPlanDTO.includeMealPlan,
      });

      await queryRunner.commitTransaction();

    } catch (error) {
      console.log(error);
      await  queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }finally{
      await queryRunner.release();
    }
    
  }

  async deleteCoachPlan(
    coachPlanId: number
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const clientWithPlan = await this.clientSubscriptionRepository.find({where: { coachPlan: { id: coachPlanId}}})
      if(clientWithPlan.length)
        throw new HttpException('There are clients subscribed to this plan', HttpStatus.INTERNAL_SERVER_ERROR)
      const coachPlanDeleted = await queryRunner.manager.delete(CoachPlan, {id: coachPlanId})
      
      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(error);
      await  queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }finally{
      await queryRunner.release();
    }
    
  }
  async createClientSubscription(createClientSubscriptionDTO: CreateClientSubscriptionDTO): Promise<ClientSubscription> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { coachPlanId, clientId, startDate, endDate } = createClientSubscriptionDTO;
      // Buscar el client
      const client = await this.userService.findUserOfClientByClientID(clientId);
      if (!client) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }
     
      await queryRunner.manager.update(Subscription, { user: {id: client.user.id}}, {
        // user: client.user, 
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: EStatus.ACTIVE,
        nextPaymentDate: new Date(endDate)
      })

      const updatedSubscription = await this.subscriptionRepository.findOne({
        where: { user: { id: client.user.id } },
      });

      // Buscar el CoachPlan
      const coachPlan = await this.coachPlanRepository.findOne({where :{ id:coachPlanId}});
      if (!coachPlan) {
        throw new HttpException('Coach Plan not found', HttpStatus.NOT_FOUND);
      }

      // Crear la ClientSubscription
      const existClientSubscription = await this.clientSubscriptionRepository.findOne({where: { subscription: { id: updatedSubscription.id}}})
      const formattedStartDate = new Date(startDate).toLocaleDateString('en-GB');
      const formattedEndDate = new Date(endDate).toLocaleDateString('en-GB');
      if(!existClientSubscription){
        const clientSubscription = await queryRunner.manager.create(ClientSubscription, {
          subscription: updatedSubscription,
          client,
          coachPlan,
        });
        // Guardar la ClientSubscription
        const clientSubscriptionSaved = await queryRunner.manager.save(ClientSubscription, clientSubscription);
        const description = `A new subscription plan (${coachPlan.name}) was successfully set for the client. Subscription period: ${formattedStartDate} to ${formattedEndDate}.`;
        await this.userService.logActivity(client.user.id, description)
        await queryRunner.commitTransaction();
        return clientSubscriptionSaved
      }else{
        await queryRunner.manager.update(ClientSubscription, {id: existClientSubscription.id}, {
          subscription: updatedSubscription,
          client,
          coachPlan,
        })
        const description = `A new subscription plan (${coachPlan.name}) was successfully set for the client. Subscription period: ${formattedStartDate} to ${formattedEndDate}.`;
        await this.userService.logActivity(client.user.id, description)
        await queryRunner.commitTransaction();
        return await this.clientSubscriptionRepository.findOne({where: { subscription: { id: updatedSubscription.id}}})
      }
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }finally{
      await queryRunner.release();
    }
    
    
  }
  async findAll(): Promise<Subscription[]> {
    return await this.subscriptionRepository.find();
  }

  async findOne(id: number): Promise<Subscription> {
    return await this.subscriptionRepository.findOne({ where: { id } });
  }
  async remove(id: number): Promise<void> {
    await this.subscriptionRepository.delete(id);
  }

  async removeClientSubscription(clientSubscriptionId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const clientSubscription = await this.clientSubscriptionRepository.findOne({where: {id:clientSubscriptionId}, relations: ['subscription', 'workoutInstances', 'client', 'client.user', 'coachPlan']})
      if(!clientSubscription)
        throw new HttpException('Client subscription not found', HttpStatus.NOT_FOUND);

      const subscriptionSaved = await queryRunner.manager.update(Subscription, {id: clientSubscription.subscription.id}, {
        startDate: null,
        endDate: null,
        status: EStatus.INACTIVE,
      })
      const formattedEndDate = new Date().toLocaleDateString('en-GB');
      const description = `The subscription plan (${clientSubscription.coachPlan.name}) was successfully canceled for the client on ${formattedEndDate}.`;
      await this.userService.logActivity(clientSubscription.client.user.id, description)
      await queryRunner.commitTransaction();
      return subscriptionSaved;
    } catch (error) {
      console.log(error.message);
      try {
        await queryRunner.rollbackTransaction();
      } catch (rollbackError) {
        console.log('Error during rollback: ', rollbackError.message);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }finally{
      await queryRunner.release();
    }
  }

  async findClientsSubscribedToCoachByUserId(userId: number) {
    try {
      const coach = await this.userService.findCoachByUserId(userId);
      if (!coach) {
        throw new HttpException('Coach not found', HttpStatus.NOT_FOUND);
      }
      return await this.clientSubscriptionRepository
        .createQueryBuilder('clientSubscription')
        .leftJoinAndSelect('clientSubscription.coachPlan', 'coachPlan')
        .leftJoinAndSelect('clientSubscription.workoutInstances', 'workoutInstance')
        .leftJoinAndSelect('workoutInstance.workout', 'workout')
        .leftJoinAndSelect('clientSubscription.client', 'client')
        .leftJoinAndSelect('clientSubscription.subscription', 'subscription')
        .leftJoinAndSelect('client.user', 'user')
        .where('coachPlan.coachId = :coachId', { coachId: coach.id })
        .andWhere('subscription.status = :status', {status: EStatus.ACTIVE})
        .getMany();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND)
    }
   
    
  }

  async findCoachSubscriptions(userId: number) {
    try {
      const coach = await this.userService.findCoachByUserId(userId);
      if (!coach) {
        throw new HttpException('Coach not found', HttpStatus.NOT_FOUND);
      }
      const coachSubscription = await this.coachSubscriptionRepository.findOne({where: {coach: {id: coach.id}}, relations: ['subscription', 'subscriptionPlan']})
      return coachSubscription;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND)
    }
  }

  async getAllCoachSubscriptionPlans(){
    return await this.subscriptionPlanRepository.find();
  }
  async findClientSubscription(clientId: number) {
    const clientSubscription = await this.clientSubscriptionRepository.findOne({
      where:  { id: clientId } ,
      relations: [
        'client',
        'client.user',
        'workoutInstances',
        'workoutInstances.workout',
        'workoutInstances.groups',
        'workoutInstances.groups.exercises',
        'workoutInstances.groups.exercises.exercise',
      ],
    });

    if (!clientSubscription) {
      throw new Error('Client subscription not found');
    }

    return clientSubscription;
  }

  async findClientSubscriptionDetails(userId: number){
    try {
      const clientSubscription = await this.clientSubscriptionRepository.findOne({
        where:  { client: { user: { id: userId }} } ,
        relations: [
          'subscription',
          'coachPlan',
          'client',
          'client.user',
          'workoutInstances',
          'workoutInstances.workout',
          'workoutInstances.groups',
          'workoutInstances.groups.exercises',
          'workoutInstances.groups.exercises.exercise',
          'workoutInstances.trainingSession',
          'workoutInstances.trainingSession.trainingWeek',
        ],
      });
  
      if (!clientSubscription) {
        throw new Error('Client subscription not found');
      }
  
      return clientSubscription;
    } catch (error) {
      console.log(error)
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
    
  }

  async setPayment( updateSubscriptionDto: UpdateSubscriptionDTO){
    const queryRunner = this.dataSource.createQueryRunner()

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { coachPlanId, clientId, startDate, endDate, paymentDate } = updateSubscriptionDto;
      // Buscar el client
      const client = await this.userService.findUserOfClientByClientID(clientId);
      if (!client) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }
     
      await queryRunner.manager.update(Subscription, { user: {id: client.user.id}}, {
        // user: client.user, 
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: EStatus.ACTIVE,
        lastPaymentDate: new Date(paymentDate),
        nextPaymentDate: new Date(endDate),
      })

      const updatedSubscription = await this.subscriptionRepository.findOne({
        where: { user: { id: client.user.id } },
      });
      await queryRunner.manager.update(ClientSubscription, { subscription: {id: updatedSubscription.id} }, {
        coachPlan: { id : coachPlanId}
      })

      const coachPlan = await this.coachPlanRepository.findOne({where: { id: coachPlanId}})
      if(!coachPlan)
        throw new HttpException('Coach Plan not found', HttpStatus.NOT_FOUND);
      const formattedStartDate = new Date(startDate).toLocaleDateString('en-GB');
      const formattedEndDate = new Date(endDate).toLocaleDateString('en-GB');
      const description = `Monthly payment of subscription plan (ID: ${coachPlan.name}) was successfully processed. Subscription period: ${formattedStartDate} to ${formattedEndDate}.`;
      await this.userService.logActivity(client.user.id, description)
      await queryRunner.commitTransaction();
      return updatedSubscription;
    } catch (error) {
      console.log(error)
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }finally{
      await queryRunner.release();
    }
  }
  
}
