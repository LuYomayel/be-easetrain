import { Injectable } from '@nestjs/common';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workout } from './entities/workout.entity';
import { DataSource } from 'typeorm';
import { ExerciseGroup } from '../exercise/entities/exercise-group.entity';
import { ExerciseInstance } from '../exercise/entities/exercise.entity';
@Injectable()
export class WorkoutService {
  constructor(
    @InjectRepository(Workout)
    private workoutRepository: Repository<Workout>,
    private dataSource: DataSource,
    @InjectRepository(ExerciseGroup)
    private exerciseGroupRepository: Repository<ExerciseGroup>,
    @InjectRepository(ExerciseInstance)
    private exerciseInstanceRepository: Repository<ExerciseInstance>,
  ) {}

  async create(createWorkoutDto: CreateWorkoutDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const workout = queryRunner.manager.create(Workout, createWorkoutDto);
      const savedWorkout = await queryRunner.manager.save(workout);

      for (const groupDto of createWorkoutDto.groups) {
        const exerciseGroup = queryRunner.manager.create(ExerciseGroup, {
          ...groupDto,
          workout: savedWorkout,
        });
        const savedGroup = await queryRunner.manager.save(exerciseGroup);

        for (const exerciseDto of groupDto.exercises) {
          const exerciseInstance = queryRunner.manager.create(
            ExerciseInstance,
            {
              ...exerciseDto,
              group: savedGroup,
            },
          );
          await queryRunner.manager.save(exerciseInstance);
        }
      }

      await queryRunner.commitTransaction();
      return savedWorkout;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all workout`;
  }

  findAllByCoachId(coachId: number) {
    const workouts = this.workoutRepository.find({
      where: { coach: { id: coachId } },
      relations: ['groups', 'groups.exercises', 'groups.exercises.exercise'],
    });
    return workouts;
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
