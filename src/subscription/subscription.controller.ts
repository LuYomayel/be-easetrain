import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import {
  CreateClientSubscriptionDTO,
  CreateCoachPlanDTO,
  CreateCoachSubscriptionDTO,
  CreateSubscriptionDTO,
} from './dto/create-suscription.dto';
import { UpdateSubscriptionDTO } from './dto/update-suscription.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// import { UpdateSubscriptionDTO } from './dto/update-suscription.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly suscriptionService: SubscriptionService) {}

  @Post()
  create(@Body() createSuscriptionDto: CreateSubscriptionDTO) {
    return this.suscriptionService.create(createSuscriptionDto);
  }

  @Post('coach/coachPlan')
  createCoachPlan(@Body() createCoachPlanDTO: CreateCoachPlanDTO) {
    return this.suscriptionService.createCoachPlan(createCoachPlanDTO);
  }

  @Put('coach/coachPlan/:coachPlanId')
  updateCoachPlan(
    @Param('coachPlanId') coachPlanId: number,
    @Body() createCoachPlanDTO: CreateCoachPlanDTO,  
  ) {
    return this.suscriptionService.updateCoachPlan(coachPlanId, createCoachPlanDTO);
  }

  @Delete('coach/coachPlan/:coachPlanId')
  deleteCoachPlan(@Param('coachPlanId') coachPlanId: number) {
    return this.suscriptionService.deleteCoachPlan(coachPlanId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('client')
  createClientSubscription(
    @Body() createClientSubscriptionDTO: CreateClientSubscriptionDTO,
    @Request() req,
  ) {
    return this.suscriptionService.createClientSubscription(
      createClientSubscriptionDTO,
      req.user.id
    );
  }


  @Get()
  findAll() {
    return this.suscriptionService.findAll();
  }

  @Get('coach-subscription-plans')
  getAllCoachSubscriptionPlans() {
    return this.suscriptionService.getAllCoachSubscriptionPlans();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suscriptionService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suscriptionService.remove(+id);
  }

  @Delete('/clientSubscription/:id')
  removeClientSubscription(@Param('id') id: string) {
    return this.suscriptionService.removeClientSubscription(+id);
  }

  @Get('coach/userId/:id')
  findCoachClientSubscribers(@Param('id') id: number) {
    return this.suscriptionService.findClientsSubscribedToCoachByUserId(id);
  }

  @Get('coach/:id')
  findCoachSubscriptions(@Param('id') id: number) {
    return this.suscriptionService.findCoachSubscriptions(id);
  }

  @Get('client/:clientId')
  findClientSubscription(@Param('clientId') clientId: number) {
    return this.suscriptionService.findClientSubscription(clientId);
  }

  @Get('client-subscription/details/:userId')
  findClientSubscriptionDetails(@Param('userId') userId: number) {
    return this.suscriptionService.findClientSubscriptionDetails(userId);
  }

  @Put('update')
  async setPayment(
    @Body() updateSubscriptionDto: UpdateSubscriptionDTO
  ){
    return await this.suscriptionService.setPayment(updateSubscriptionDto);
  }

  @Put('coach-subscription')
  updateCoachSubscription(@Body('userId') userId: number, @Body('planId') planId: number) {
    return this.suscriptionService.updateCoachSubscription(userId, planId);
  }
  
}
