import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto, AssignWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { CreateFeedbackDto } from './dto/create-feedback-dto';
import { AssignWorkoutsToCycleDTO, CreateCycleDto } from './entities/create-cycle.dto';

@Controller('workout')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  // @Post('/copy/:planId')
  // copyWorkoutPlan(@Param('planId') planId: number) {
  //   return this.workoutService.copyWorkoutPlan(planId);
  // }

  @Get()
  findAll() {
    return this.workoutService.findAll();
    // return this.workoutService.seedDatabase();
  }

  @Get('workout-instance/:id')
  findWorkoutInstance(
    @Param('id') workoutinstanceId: number
  ) {
    return this.workoutService.findOne(workoutinstanceId);
    // return this.workoutService.seedDatabase();
  }
  
  @Get('training-cycles/coachId/:coachId')
  findAllTrainingCyclesByCoach(
    @Param('coachId') coachId: number
  ) {
    return this.workoutService.findAllTrainingCyclesByCoach(coachId);
  }
  @Get('training-cycles/clientId/:clientId')
  findAllTrainingCyclesByClient(
    @Param('clientId') clientId: number
  ) {
    return this.workoutService.findAllTrainingCyclesByStudent(clientId);
  }
  @Get('/coachId/:coachId/clientId/:clientId')
  findAllByCoachIdAndClient(
    @Param('coachId') coachId: string,
    @Param('clientId') clientId: string,
  ) {
    return this.workoutService.findAllWorkoutsByCoachIdExcludingClientId(
      +coachId,
      +clientId,
    );
  }

  @Get('/clientId/:clientId')
  findAllWorkoutsByClientId(@Param('clientId') clientId: number) {
    return this.workoutService.findAllByClientId(clientId);
  }

  @Get('/client/userId/:userId')
  findAllClientWorkoutsByUserId(@Param('userId') userId: number) {
    return this.workoutService.findAllClientWorkoutsByUserId(userId);
  }

  @Get('/userId/:userId')
  findClientWorkoutsByUserId(@Param('userId') userId: number) {
    return this.workoutService.findClientWorkoutsByUserId(userId);
  }

  @Get('/clientId/:clientId/planId/:planId')
  findOneWorkoutByClientId(@Param('clientId') clientId: number, @Param('planId') planId:number) {
    return this.workoutService.findOneWorkoutByClientId(clientId, planId);
  }
  @Get('/coachId/:coachId')
  findAllByCoachId(@Param('coachId') coachId: number) {
    return this.workoutService.findAllByCoachId(coachId);
  }

  @Get('/coach-workouts/userId/:userId')
  findAllCoachWorkoutsByUserId(@Param('userId') userId: number) {
    return this.workoutService.findAllCoachWorkoutsByUserId(userId);
  }

  @Post()
  create(@Body() createWorkoutDto: CreateWorkoutDto) {
    return this.workoutService.create(createWorkoutDto);
  }
  @Post('/assignWorkout')
  assignWorkout(@Body() assignWorkoutDto: AssignWorkoutDto) {
    return this.workoutService.assignWorkout(assignWorkoutDto);
  }

  @Post('/feedback/:id')
  async submitFeedback(
    @Param('id') id: number,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    return this.workoutService.submitFeedback(id, createFeedbackDto);
  }
  
  @Post('/training-cycles')
  async createTrainingCycle(@Body() createCycleDto: CreateCycleDto)
  {
    return this.workoutService.createTrainingCycle(createCycleDto)
  }
  @Post('assign-session/:sessionId')
  assignWorkoutToSession(
    @Param('sessionId') sessionId: number,
    @Body('workoutId') workoutId: number,
    @Body('clientId') clientId: number,
  ) {
    console.log(workoutId,clientId)
    return this.workoutService.assignWorkoutToSession(sessionId, workoutId, clientId);
  }

  @Post('assign-cycle/:id/assign-workouts/:clientId')
  async assignWorkoutsToCycle(@Param('id') id: number, @Body() assignWorkoutsToCycleDTO: AssignWorkoutsToCycleDTO, @Param('clientId') clientId: number) {
    return this.workoutService.assignWorkoutsToCycle(id, assignWorkoutsToCycleDTO, clientId);
  }

  @Put('/template/:id')
  updateWorkoutTemplate(@Param('id') id: string, @Body() updateWorkoutDto: UpdateWorkoutDto) {
    return this.workoutService.updateWorkoutTemplate(updateWorkoutDto);
  }

  @Put('/instance/:id')
  updateWorkoutInstance(@Param('id') id: string, @Body() updateWorkoutDto: UpdateWorkoutDto) {
    return this.workoutService.updateWorkoutInstance(updateWorkoutDto);
  }

  @Delete(':id')
  removeWorkout(@Param('id') id: string) {
    return this.workoutService.removeWorkout(+id);
  }
  
  
  @Delete('/deleteInstance/:instanceId')
  removeWorkoutInstance(@Param('instanceId') instanceId: number) {
    return this.workoutService.removeWorkoutInstance(instanceId);
  }
}
