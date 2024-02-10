import { Injectable } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { Exercise } from './entities/exercise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BodyArea } from './entities/body-area.entity';
@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(BodyArea)
    private bodyAreaRepository: Repository<BodyArea>,
  ) {}
  create(createExerciseDto: CreateExerciseDto) {
    return 'This action adds a new exercise';
  }

  findAll() {
    return `This action returns all exercise`;
  }

  findOne(id: number) {
    return `This action returns a #${id} exercise`;
  }

  update(id: number, updateExerciseDto: UpdateExerciseDto) {
    return `This action updates a #${id} exercise`;
  }

  remove(id: number) {
    return `This action removes a #${id} exercise`;
  }

  findAllWithBodyArea() {
    const bodyAreas = this.bodyAreaRepository.find();
    return bodyAreas;
  }
}
