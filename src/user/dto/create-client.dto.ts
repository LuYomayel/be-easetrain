import { MinDate , IsEmail, IsString, IsDate, IsNumber, IsEnum, IsArray, Min, Max, Validate, MaxDate } from 'class-validator';
import { Type } from 'class-transformer';
import { EActivityLevel, EFitnessGoal } from '../entities/client.entity';

// Suponiendo que estos son los valores permitidos para el género.
enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other'
}

const tenYearsAgo = new Date();
tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
console.log(tenYearsAgo)
export class CreateClientDTO {
  @IsEmail({}, { message: 'Invalid email address.' })
  email: string;

  @IsString({ message: 'Name must be a string.' })
  name: string;

  @IsArray({ message: 'Fitness goals must be an array of strings.' })
  @IsEnum(EFitnessGoal, { each: true, message: 'Invalid fitness goal.' })
  fitnessGoal: EFitnessGoal[];

  @IsEnum(EActivityLevel, { message: 'Invalid activity level.' })
  activityLevel: EActivityLevel;

  @Type(() => Date) // Transformar el valor a tipo Date
  @IsDate({ message: 'Birthdate must be a valid date.' })
  @MaxDate(tenYearsAgo, { message: 'Birthdate must be at least 10 years ago.' })
  birthdate: Date;

  @IsEnum(Gender, { message: 'Gender must be either male, female, or other.' })
  gender: Gender;

  @IsNumber({}, { message: 'Height must be a number.' })
  @Min(50, { message: 'Height must be at least 50 cm.' })
  @Max(300, { message: 'Height must be at most 300 cm.' })
  height: number;

  @IsNumber({}, { message: 'Weight must be a number.' })
  @Min(20, { message: 'Weight must be at least 20 kg.' })
  @Max(500, { message: 'Weight must be at most 500 kg.' })
  weight: number;

  @IsNumber({}, { message: 'Coach ID must be a number.' })
  coachId: number;
}