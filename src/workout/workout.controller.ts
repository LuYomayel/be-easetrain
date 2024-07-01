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

@Controller('workout')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Post()
  create(@Body() createWorkoutDto: CreateWorkoutDto) {
    return this.workoutService.create(createWorkoutDto);
  }

  @Post('/copy/:planId')
  copyWorkoutPlan(@Param('planId') planId: number) {
    return this.workoutService.copyWorkoutPlan(planId);
  }

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

  @Get('/clientId/:clientId/planId/:planId')
  findOneWorkoutByClientId(@Param('clientId') clientId: number, @Param('planId') planId:number) {
    return this.workoutService.findOneWorkoutByClientId(clientId, planId);
  }
  @Get('/coachId/:coachId')
  findAllByCoachId(@Param('coachId') coachId: number) {
    return this.workoutService.findAllByCoachId(coachId);
  }

  

  @Put(':id')
  update(@Param('id') id: string, @Body() updateWorkoutDto: UpdateWorkoutDto) {
    return this.workoutService.update(updateWorkoutDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workoutService.remove(+id);
  }

}
