import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { EUserType, User } from '../user/entities/user.entity';
import { EmailService } from '../email/email.service';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private dataSource: DataSource
  ) {
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);

    if (user && await bcrypt.compare(pass,user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      userId: user.id, 
      userType: user.userType ,
      isVerified: user.isVerified
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signUp(email: string, password: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Crear el usuario en la base de datos
        const user = queryRunner.manager.create(User, { email, password: hashedPassword, userType: EUserType.COACH });
        const userSaved= await queryRunner.manager.save(user);

        // Generar un token de verificación
        const verificationToken = this.jwtService.sign({ email });

        // Enviar el correo de verificación
        try {
            await this.emailService.sendVerificationEmail(email, verificationToken);
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            throw new HttpException('Error sending verification email', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        await queryRunner.commitTransaction();
        return userSaved;
    } catch (error) {
        console.error('Transaction error:', error);
        await queryRunner.rollbackTransaction();
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } finally {
        await queryRunner.release();
    }
}

  async sendVerificationEmail(email: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.userService.findByEmail(email);
      console.log('User:', user);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const token = this.jwtService.sign({ email });
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      try {
        console.log('Sending verification email to:', email);
        
        await this.emailService.sendVerificationEmail(email, verificationLink);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
          throw new HttpException('Error sending verification email', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
        console.error('Transaction error:', error);
        await queryRunner.rollbackTransaction();
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } finally {
        await queryRunner.release();
    }
  }

  async verifyEmail(token: string){ 
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const decoded = this.jwtService.verify(token);
      const email = decoded.email;
  
      // Mark the user as verified
      await this.userService.verifyUser(email);
  
      await queryRunner.commitTransaction();
      return { message: 'Email verified successfully' };
    } catch (error) {
        console.error('Transaction error:', error);
        await queryRunner.rollbackTransaction();
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } finally {
        await queryRunner.release();
    }
    
  }

  async sendPasswordResetLink(email: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const user = await this.userService.findByEmail(email);
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
    
        const token = this.jwtService.sign({ email });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        try {
          await this.emailService.sendPasswordResetEmail(email, resetLink);
        } catch (emailError) {
          console.error('Error sending verification email:', emailError);
            throw new HttpException('Error sending verification email', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        await queryRunner.commitTransaction();
    } catch (error) {
        console.error('Transaction error:', error);
        await queryRunner.rollbackTransaction();
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } finally {
        await queryRunner.release();
    }
    
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = this.jwtService.verify(token);
      const email = decoded.email;

      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      return await this.userService.updatePassword(user.id, hashedPassword);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.REQUEST_TIMEOUT);
    }
  }
}