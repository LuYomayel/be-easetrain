import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('import/:id')
  @UseInterceptors(FileInterceptor('file'))
  async importExercises(@UploadedFile() file: Express.Multer.File, @Param('id') coachId: number) {
    // console.log('dasdas estoy aca', file)
    return await this.exerciseService.importExercises(file.buffer, coachId);
  }

}
