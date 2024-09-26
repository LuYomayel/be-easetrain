import { Controller, Request, Post, UseGuards, Body, Get, Query, HttpException, HttpStatus, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    ) {}

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    try {
      return await this.authService.verifyEmail(token);
    } catch (error) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-token')
  verifyToken(@Request() req) {
    // Si el guard pasó, entonces el token es válido
    return { valid: true };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.sendPasswordResetLink(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('signUp')
  async signUp(
    @Body('email') email: string, 
    @Body('password') password: string) {
    // return {email, password};
    return this.authService.signUp(email, password);
  }

  @Post('send-verification-email')
  async sendVerificationEmail(@Body('email') email: string) {
    return this.authService.sendVerificationEmail(email);
  }
}