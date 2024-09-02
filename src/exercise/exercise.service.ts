import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { Exercise, IExercise } from './entities/exercise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BodyArea } from './entities/body-area.entity';
import { ExerciseBodyArea } from './entities/exercise-body-area.entity';
import { UserService } from '../user/user.service';
import * as XLSX from 'xlsx';
@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(BodyArea)
    private bodyAreaRepository: Repository<BodyArea>,
    @InjectRepository(ExerciseBodyArea)
    private exerciseBodyAreaRepository: Repository<ExerciseBodyArea>,
    private userService: UserService,
    private dataSource: DataSource
  ) {}
  async create(createExerciseDto: CreateExerciseDto) {
    const queryRunner = await this.dataSource.createQueryRunner();

    queryRunner.connect();
    queryRunner.startTransaction();
    try {
      // Buscar el usuario, agregarlo al ejercicio y guardarlo,
      const coach = await this.userService.findCoachByUserId(createExerciseDto.coachId);
      if(!coach)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND)

      // Para cada ID de bodyArea, busca la entidad BodyArea correspondiente,
      // crea una nueva entidad ExerciseBodyArea, y guárdala.

      const exercise = await queryRunner.manager.create(Exercise, {
        exerciseType: createExerciseDto.exerciseType,
        equipmentNeeded: createExerciseDto.equipmentNeeded,
        name: createExerciseDto.name,
        description: createExerciseDto.description,
        coach,
        createdByAdmin: false,
        createdByCoach: true,
        multimedia: createExerciseDto.multimedia,
      });

      const createdExercise = await queryRunner.manager.save(Exercise, exercise);
      // Manejar las áreas del cuerpo
    if (createExerciseDto.bodyArea.length >= 1) {
      await Promise.all(createExerciseDto.bodyArea.map(async (bodyAreaId) => {
        const exerciseBodyAreaCreated = queryRunner.manager.create(ExerciseBodyArea, {
          exercise: createdExercise, 
          bodyArea: { id: bodyAreaId }
        });
        await queryRunner.manager.save(ExerciseBodyArea, exerciseBodyAreaCreated);
      }));
    }
      await queryRunner.commitTransaction();
      return createdExercise;
    } catch (error) {
      console.log(error)
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    } finally{
      await queryRunner.release();
    }
    
  }

  async findAll() {
    return await this.exerciseRepository.find();
  }

  async findExercisesByCoachUserId(userId: number){
    try {
      return await this.exerciseRepository.find( 
        {
        where: 
        { coach: { 
          user: { 
            id: userId
            } 
          } 
        }, 
        relations: ['coach', 'exerciseBodyAreas', 'exerciseBodyAreas.bodyArea'] 
        }
      )
    } catch (error) {
      console.error(error)
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async update(id: number, updateExerciseDto: UpdateExerciseDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const exercise = await this.exerciseRepository.findOne({ where: { id }, relations: ['exerciseBodyAreas', 'exerciseBodyAreas.bodyArea'] });
      if (!exercise) {
        throw new HttpException('Exercise not found', HttpStatus.NOT_FOUND);
      }

      // Actualizar el ejercicio
      Object.assign(exercise, updateExerciseDto);
      const updatedExercise = await queryRunner.manager.save(exercise);

      // Manejar las áreas del cuerpo
      if (updateExerciseDto.bodyArea) {
        await this.exerciseBodyAreaRepository.delete({ exercise: { id } });

        await Promise.all(updateExerciseDto.bodyArea.map(async (bodyAreaId) => {
          const exerciseBodyAreaCreated = this.exerciseBodyAreaRepository.create({
            exercise: updatedExercise,
            bodyArea: { id: bodyAreaId }
          });
          await queryRunner.manager.save(exerciseBodyAreaCreated);
        }));
      }

      await queryRunner.commitTransaction();
      return updatedExercise;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const exercise = await this.exerciseRepository.findOne({ where: { id }, relations: ['exerciseBodyAreas'] });
      if (!exercise) {
        throw new HttpException('Exercise not found', HttpStatus.NOT_FOUND);
      }

      // Eliminar las relaciones de áreas del cuerpo
      await this.exerciseBodyAreaRepository.delete({ exercise: { id } });

      // Eliminar el ejercicio
      await this.exerciseRepository.delete(id);

      await queryRunner.commitTransaction();
      return { message: 'Exercise removed successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  findAllWithBodyArea() {
    const bodyAreas = this.bodyAreaRepository.find();
    return bodyAreas;
  }

  private isValidYouTubeUrl(url: string): boolean {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/i;
    // console.log(regex.test(url), url);
    return regex.test(url);
  }

  async importExercises(fileBuffer: Buffer, coachId: number): Promise<any> {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const exercises: IExercise[] = XLSX.utils.sheet_to_json(worksheet);
      
      const validExercises = exercises.filter(exercise => {
        return this.isValidYouTubeUrl(exercise.multimedia);
      });

      const duplicateExercises = [];
      const registeredExercises = [];
      let rowIndex = 1;

      for (const exercise of validExercises) {
        const existingExercise = await this.exerciseRepository.findOne({
          where: { name: exercise.name, coach: { id: coachId }, createdByCoach: true },
        });

        if (existingExercise) {
          duplicateExercises.push({ exercise, rowIndex });
        } else {
          const newExercise = this.exerciseRepository.create({
            name: exercise.name,
            description: exercise.description,
            multimedia: exercise.multimedia,
            exerciseType: exercise.exerciseType,
            equipmentNeeded: exercise.equipmentNeeded,
            createdByCoach: true,
            createdByAdmin: false,
            coach: {id: coachId},
          });
          registeredExercises.push({ exercise, rowIndex });
          await this.exerciseRepository.save(newExercise);
        }

        rowIndex++;
      }

      return { 
        message: 'Exercises imported successfully',
        registeredExercises: registeredExercises.map(de => ({
          name: de.exercise.name,
          row: de.rowIndex
        })),
        duplicateExercises: duplicateExercises.map(de => ({
          name: de.exercise.name,
          row: de.rowIndex
        })),
        duplicatesCount: duplicateExercises.length,
        registeredExercisesCount: registeredExercises.length
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
