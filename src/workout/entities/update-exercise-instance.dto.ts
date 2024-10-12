import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateExerciseInstanceDto {
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsOptional()
    @IsString()
    repetitions?: string;

    @IsOptional()
    @IsString()
    sets?: string;

    @IsOptional()
    @IsString()
    time?: string;

    @IsOptional()
    @IsString()
    weight?: string;

    @IsOptional()
    @IsString()
    restInterval?: string;

    @IsOptional()
    @IsString()
    tempo?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    difficulty?: string;

    @IsOptional()
    @IsString()
    duration?: string;

    @IsOptional()
    @IsString()
    distance?: string;
}
