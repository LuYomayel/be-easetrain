import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto, AssignWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { CreateFeedbackDto } from './dto/create-feedback-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssignWorkoutsToCycleDTO, CreateCycleDto } from './entities/create-cycle.dto';
import { CreateRpeDto } from './entities/create-rpe-dto';

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
  @Get('training-cycles/client/userId/:userId')
  findAllTrainingCyclesForClientByUserId(
    @Param('userId') userId: number
  ) {
    return this.workoutService.findAllTrainingCyclesForClientByUserId(userId);
  }
  @Get('training-cycles/client/clientId/:clientId')
  findAllTrainingCyclesForClientByClientId(
    @Param('clientId') clientId: number
  ) {
    return this.workoutService.findAllTrainingCyclesForClientByClientId(clientId);
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
  @Get('/training-cycle/:cycleId/day/:dayNumber')
  async getTrainingCyclesByCycleIdAndDayNumber(
    @Param('cycleId') cycleId: number,
    @Param('dayNumber') dayNumber: number,
  ) {
    return await this.workoutService.findTrainingCyclesByCycleIdAndDayNumber(cycleId, dayNumber);
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

  @Get('/feedback/:sessionId')
  async getFeedback(
    @Param('sessionId') sessionId: number,
  ) {
    return this.workoutService.getWorkoutInstanceWithFeedback(sessionId);
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
  updateWorkoutTemplate(@Body() updateWorkoutDto: UpdateWorkoutDto) {
    return this.workoutService.updateWorkoutTemplate(updateWorkoutDto);
  }

  @Put('/instance/:id')
  updateWorkoutInstance(@Body() updateWorkoutDto: UpdateWorkoutDto) {
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

  @Delete('/delete-instances-cycle/:cycleId')
  removeWorkoutsFromCycle(
    @Param('cycleId') cycleId: number,
    @Body() assignWorkoutsToCycleDTO: AssignWorkoutsToCycleDTO,
  ) {
    return this.workoutService.removeWorkoutsFromCycle(cycleId, assignWorkoutsToCycleDTO);
  }

  @Post('/import-plan-from-image')
  @UseInterceptors(FileInterceptor('file'))
  async importPlanFromImage(@UploadedFile() file: Express.Multer.File) {
  // async importPlanFromImage(@UploadedFile() image: Express.Multer.File) {
    console.log('Imagen',file);
    return await this.workoutService.importPlanFromImage(file);
  }


  @Post('/rpe/create')
  async createRpeMethod(@Body() createRpeDto: CreateRpeDto, @Param('coachId') coachId: number) {
    return this.workoutService.createRpeMethod(createRpeDto, coachId);
  }

  @Post('/rpe/assign')
  async assignRpeToTarget(
    @Body() body: { rpeMethodId: number; targetType: string; targetId: number },
    @Param('coachId') coachId: number,
  ) {
    return this.workoutService.assignRpeToTarget(body.rpeMethodId, body.targetType, body.targetId, coachId);
  }

  @Post('rpe/target/:type/:id')
  async getRpeAssignmentsByTarget(@Param('type') targetType: string, @Param('id') targetId: number) {
    return this.workoutService.getRpeAssignmentsByTarget(targetType, targetId);
  }
}
