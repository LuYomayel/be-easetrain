import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter;
    private env;
    constructor(configService: ConfigService){
        this.env ={
            email_service: configService.get<string>('EMAIL_SERVICE'),
            email_user: configService.get<string>('EMAIL_USER'),
            email_password: configService.get<string>('EMAIL_PASSWORD'),
            frontEnd_url: configService.get<string>('FRONTEND_URL'),
        }
        this.transporter = nodemailer.createTransport({
            host: this.env.email_service,
            // port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: this.env.email_user,
              pass: this.env.email_password,
            },
          });
    }

    async sendVerificationEmail(to: string, token: string) {
        const verificationUrl = `${this.env.frontEnd_url}/verify-email?token=${token}`;
    
        const mailOptions = {
          from: '<No Responder>',
          to,
          subject: 'Email Verification',
          text: `Please verify your email by clicking the following link: ${verificationUrl}`,
          html: `<p>Please verify your email by clicking the following link:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
        };
    
        await this.transporter.sendMail(mailOptions);
    }
    async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Password Reset',
        text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
        html: `<p>You requested a password reset. Click the link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
      };
  
      await this.transporter.sendMail(mailOptions);
    }

}
