import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email address.' })
  email: string;

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password cannot be empty.' })
  @Length(6, 50, { message: 'Password must be between 6 and 50 characters.' })
  password: string;
}