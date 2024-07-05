import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { EUserType } from '../user/entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    const verif = await bcrypt.compare(pass, user.password);
    if (user && await bcrypt.compare(pass, user.password)) {
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
      name: user.name,
      surname: user.surname,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signUp(email: string, password: string) {
    // Create the user in the database
    const user = await this.userService.create({email, password, userType: EUserType.COACH});
    
    // Generate a verification token
    const verificationToken = this.jwtService.sign({ email });
    
    // Send verification email
    await this.emailService.sendVerificationEmail(email, verificationToken);

    return user;
  }

  async verifyEmail(token: string){ 
    const decoded = this.jwtService.verify(token);
    const email = decoded.email;

    // Mark the user as verified
    await this.userService.verifyUser(email);

    return { message: 'Email verified successfully' };
  }

  async sendPasswordResetLink(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const token = this.jwtService.sign({ email });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    await this.emailService.sendPasswordResetEmail(email, resetLink);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = this.jwtService.verify(token);
      const email = decoded.email;

      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      console.log('New pass: ', newPassword)
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      return await this.userService.updatePassword(user.id, hashedPassword);
    } catch (error) {
      throw new HttpException('Invalid or expired token', HttpStatus.REQUEST_TIMEOUT);
    }
  }
}