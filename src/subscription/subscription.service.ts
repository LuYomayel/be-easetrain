import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
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
  ) {}

  async create(
    createSubscriptionDTO: CreateSubscriptionDTO,
  ): Promise<Subscription> {
    console.log(createSubscriptionDTO);
    const user = await this.userService.findOne(createSubscriptionDTO.userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    console.log('user', user);
    const newSubscription = this.subscriptionRepository.create({
      user,
    });
    console.log('newSubscription', newSubscription);
    try {
      return await this.subscriptionRepository.save(newSubscription);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'An error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createCoachSubscription(
    createCoachSubscriptionDTO: CreateCoachSubscriptionDTO,
  ): Promise<CoachSubscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: createCoachSubscriptionDTO.subscriptionId },
    });
    if (!subscription) {
      throw new HttpException('Subscription not found', HttpStatus.NOT_FOUND);
    }
    const coach = await this.userService.findOne(
      createCoachSubscriptionDTO.coachId,
    );
    if (!coach) {
      throw new HttpException('Coach not found', HttpStatus.NOT_FOUND);
    }
    const newCoachSubscription = this.coachSubscriptionRepository.create({
      subscription,
      coach,
      tier: createCoachSubscriptionDTO.tier,
    });
    return await this.coachSubscriptionRepository.save(newCoachSubscription);
  }

  async createCoachPlan(
    createCoachPlanDTO: CreateCoachPlanDTO,
  ): Promise<CoachSubscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: createCoachPlanDTO.subscriptionId },
    });
    if (!subscription) {
      throw new HttpException('Subscription not found', HttpStatus.NOT_FOUND);
    }
    const coach = await this.userService.findOne(createCoachPlanDTO.coachId);
    if (!coach) {
      throw new HttpException('Coach not found', HttpStatus.NOT_FOUND);
    }
    const newCoachSubscription = this.coachPlanRepository.create({
      coach,
      price: createCoachPlanDTO.price,
      name: createCoachPlanDTO.name,
      workoutsPerWeek: createCoachPlanDTO.workoutsPerWeek,
      includeMealPlan: createCoachPlanDTO.includeMealPlan,
    });
    return await this.coachSubscriptionRepository.save(newCoachSubscription);
  }

  async createClientSubscription(
    createClientSubscriptionDTO: CreateClientSubscriptionDTO,
  ): Promise<ClientSubscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: createClientSubscriptionDTO.subscriptionId },
    });
    if (!subscription) {
      throw new HttpException('Subscription not found', HttpStatus.NOT_FOUND);
    }
    const client = await this.userService.findOne(
      createClientSubscriptionDTO.clientId,
    );
    if (!client) {
      throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
    }
    const coach = await this.userService.findOne(
      createClientSubscriptionDTO.coachId,
    );
    if (!coach) {
      throw new HttpException('Coach not found', HttpStatus.NOT_FOUND);
    }
    const coachPlan = await this.coachPlanRepository.findOne({
      where: { coach: { id: coach.id } },
    });
    if (!coachPlan) {
      throw new HttpException('Coach Plan not found', HttpStatus.NOT_FOUND);
    }
    const newClientSubscription = this.clientSubscriptionRepository.create({
      subscription,
      client,
      coachPlan,
    });
    return await this.clientSubscriptionRepository.save(newClientSubscription);
  }
  async findAll(): Promise<Subscription[]> {
    return await this.subscriptionRepository.find();
  }

  async findOne(id: number): Promise<Subscription> {
    return await this.subscriptionRepository.findOne({ where: { id } });
  }

  // async update(
  //   id: number,
  //   updateSubscriptionDTO: UpdateSubscriptionDTO,
  // ): Promise<void> {
  //   await this.subscriptionRepository.update(id, updateSubscriptionDTO);
  // }

  async remove(id: number): Promise<void> {
    await this.subscriptionRepository.delete(id);
  }
}
