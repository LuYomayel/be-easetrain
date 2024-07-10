import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put
} from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post()
  create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exerciseService.create(createExerciseDto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateExerciseDto: UpdateExerciseDto) {
    return this.exerciseService.update(id, updateExerciseDto);
  }

@Delete(':id')
  remove(@Param('id') id: number) {
    return this.exerciseService.remove(id);
  }

  @Get()
  findAll() {
    return this.exerciseService.findAll();
  }

  @Get('coach/:userId')
  findExercisesByCoachUserId(
    @Param('userId') userId: number
  ) {
    return this.exerciseService.findExercisesByCoachUserId(userId);
  }

  @Get('body-area')
  findAllWithBodyArea() {
    return this.exerciseService.findAllWithBodyArea();
  }

}
