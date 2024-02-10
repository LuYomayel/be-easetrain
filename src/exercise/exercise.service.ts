import { Injectable } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { Exercise } from './entities/exercise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BodyArea } from './entities/body-area.entity';
import { ExerciseBodyArea } from './entities/exercise-body-area.entity';
@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(BodyArea)
    private bodyAreaRepository: Repository<BodyArea>,
    @InjectRepository(ExerciseBodyArea)
    private exerciseBodyAreaRepository: Repository<ExerciseBodyArea>,
  ) {}
  async create(createExerciseDto: CreateExerciseDto) {
    const { bodyArea, ...createExercise } = createExerciseDto;
    const exercise = await this.exerciseRepository.create(createExercise);
    const createdExercise = await this.exerciseRepository.save(exercise);
    if (createdExercise && bodyArea) {
      // Para cada ID de bodyArea, busca la entidad BodyArea correspondiente,
      // crea una nueva entidad ExerciseBodyArea, y guárdala.
      await Promise.all(
        bodyArea.map(async (bodyAreaId) => {
          const bodyArea = await this.bodyAreaRepository.findOneBy({
            id: bodyAreaId,
          });
          if (!bodyArea) {
            throw new Error(`BodyArea not found with ID ${bodyAreaId}`);
          }

          const exerciseBodyArea = this.exerciseBodyAreaRepository.create({
            exercise: createdExercise, // Pasa la instancia de Exercise directamente
            bodyArea: bodyArea, // Pasa la instancia de BodyArea directamente
          });

          await this.exerciseBodyAreaRepository.save(exerciseBodyArea);
        }),
      );
    }

    return createdExercise;
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
