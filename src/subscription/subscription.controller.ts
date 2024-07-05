import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import {
  CreateClientSubscriptionDTO,
  CreateCoachPlanDTO,
  CreateCoachSubscriptionDTO,
  CreateSubscriptionDTO,
} from './dto/create-suscription.dto';
// import { UpdateSubscriptionDTO } from './dto/update-suscription.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly suscriptionService: SubscriptionService) {}

  @Post()
  create(@Body() createSuscriptionDto: CreateSubscriptionDTO) {
    return this.suscriptionService.create(createSuscriptionDto);
  }

  @Post('coach/plan')
  createCoachPlan(@Body() createCoachPlanDTO: CreateCoachPlanDTO) {
    return this.suscriptionService.createCoachPlan(createCoachPlanDTO);
  }

  @Post('client')
  createClientSubscription(
    @Body() createClientSubscriptionDTO: CreateClientSubscriptionDTO,
  ) {
    return this.suscriptionService.createClientSubscription(
      createClientSubscriptionDTO,
    );
  }

  @Get()
  findAll() {
    return this.suscriptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suscriptionService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suscriptionService.remove(+id);
  }

  @Get('coach/userId/:id')
  findCoachSubscriptions(@Param('id') id: number) {
    return this.suscriptionService.findClientsSubscribedToCoachByUserId(id);
  }

  @Get('client/:clientId')
  findClientSubscription(@Param('clientId') clientId: number) {
    return this.suscriptionService.findClientSubscription(clientId);
  }
}
