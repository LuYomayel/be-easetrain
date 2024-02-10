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

  @Post('coach')
  createCoachSubscription(
    @Body() createCoachSubscriptionDTO: CreateCoachSubscriptionDTO,
  ) {
    return this.suscriptionService.createCoachSubscription(
      createCoachSubscriptionDTO,
    );
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

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateSuscriptionDto: UpdateSuscriptionDto,
  // ) {
  //   return this.suscriptionService.update(+id, updateSuscriptionDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suscriptionService.remove(+id);
  }

  @Get('coach/:id')
  findCoachSubscriptions(@Param('id') id: number) {
    return this.suscriptionService.findClientsSubscribedToCoach(id);
  }
}
