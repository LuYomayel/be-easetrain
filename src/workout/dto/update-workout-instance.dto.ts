import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkoutInstanceDto } from './create-workout-instance.dto';

export class UpdateWorkoutInstanceDto extends PartialType(CreateWorkoutInstanceDto) {}