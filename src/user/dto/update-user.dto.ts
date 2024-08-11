import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDTO {
  @IsString()
  @IsOptional()
  username?: string;

  @IsEmail({}, { message: 'Invalid email address.' })
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsString({ message: 'Password must be a string.' })
  @Length(6, 50, { message: 'Password must be between 6 and 50 characters.' })
  password?: string;

  // Otros campos opcionales...
}