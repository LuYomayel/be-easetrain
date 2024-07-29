import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workout, WorkoutInstance } from '../workout/entities/workout.entity';
import { Exercise, ExerciseInstance } from '../exercise/entities/exercise.entity';
import { ExerciseGroup } from '../exercise/entities/exercise-group.entity';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(Workout)
    private workoutRepository: Repository<Workout>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(ExerciseInstance)
    private exerciseInstanceRepository: Repository<ExerciseInstance>,
  ) {}

  async importExcel(file: Express.Multer.File): Promise<void> {
    const workbook = await XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = await XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];

    // Assuming the first row contains headers, skip it
    const data = jsonData.slice(1);
    // console.log(data)
    for (const row of data) {
        // console.log(row.length)
        if(row.length > 0){
            for(let i = 0; i < row.length; i++){
                if(row[i])console.log(row[i])
            }
        }

    
        // return
        // console.log(
        //     row[0], 
        //     row[1], 
        //     row[2], 
        //     row[3], 
        //     row[4], row[5],row[6], row[7],row[8],row[9],row[10],row[11],row[12],
        //     row[13],
        //     row[14], 
        //     row[15],
        //     row[16],
        //     row[17],
        //     row[18],
        //     row[19],
        //     row[20],
        //     row[21],
        //     row[22],
        //     row[23],
        //     row[24],
        //     row[25],
        //     row[26],
        //     row[27])
    }
  }
  private isWorkoutHeader(row: any[]): boolean {
    // Add logic to identify a workout header row
    return row[0];
  }
}