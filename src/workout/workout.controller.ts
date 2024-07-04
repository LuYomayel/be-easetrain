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

@Controller('workout')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Post()
  create(@Body() createWorkoutDto: CreateWorkoutDto) {
    return this.workoutService.create(createWorkoutDto);
  }

  // @Post('/copy/:planId')
  // copyWorkoutPlan(@Param('planId') planId: number) {
  //   return this.workoutService.copyWorkoutPlan(planId);
  // }

  @Get()
  findAll() {
    return this.workoutService.findAll();
    // return this.workoutService.seedDatabase();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workoutService.findOne(+id);
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

  @Get('/userId/:userId')
  findAllByUserId(@Param('userId') userId: number) {
    return this.workoutService.findAllByUserId(userId);
  }

  @Get('/clientId/:clientId/planId/:planId')
  findOneWorkoutByClientId(@Param('clientId') clientId: number, @Param('planId') planId:number) {
    return this.workoutService.findOneWorkoutByClientId(clientId, planId);
  }
  @Get('/coachId/:coachId')
  findAllByCoachId(@Param('coachId') coachId: number) {
    return this.workoutService.findAllByCoachId(coachId);
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
