import { Injectable } from '@nestjs/common';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workout } from './entities/workout.entity';

@Injectable()
export class WorkoutService {
  constructor(
    @InjectRepository(Workout)
    private workoutRepository: Repository<Workout>,
  ) {}
  create(createWorkoutDto: CreateWorkoutDto) {
    const workout = this.workoutRepository.create(createWorkoutDto);
    console.log(workout);
    return workout;
    return this.workoutRepository.save(workout);
  }

  findAll() {
    return `This action returns all workout`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workout`;
  }

  update(id: number, updateWorkoutDto: UpdateWorkoutDto) {
    return `This action updates a #${id} workout`;
  }

  remove(id: number) {
    return `This action removes a #${id} workout`;
  }
}
