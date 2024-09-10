import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { User } from '../user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly usersService: UserService,
) {}

  @Post('send')
  async sendMessage(
    @Body('senderId') senderId: number,
    @Body('receiverId') receiverId: number,
    @Body('content') content: string,
    @Body('fileUrl') fileUrl: string,
    @Body('fileType') fileType: string,
  ) {
    const sender = await this.usersService.findOne(senderId); // Implementar findUserById en tu UsersService
    const receiver = await this.usersService.findOne(receiverId);
    return this.messagesService.sendMessage(sender, receiver, content, fileUrl, fileType);
  }

  @Get(':user1Id/:user2Id')
  async getMessages(
    @Param('user1Id') user1Id: number,
    @Param('user2Id') user2Id: number,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('page') page: number,  
  ) {
    const user1 = await this.usersService.findOne(user1Id);
    if (!user1) {
      throw new Error('User not found');
    }
    const user2 = await this.usersService.findOne(user2Id);
    
    return this.messagesService.getMessagesBetweenUsers(user1, user2, limit, page);
  }

  @Post('mark-as-read/:id')
  async markAsRead(@Param('id') id: number) {
    return this.messagesService.markAsRead(id);
  }

  @Get('coach/:coachId/last-messages')
  async getLastMessages(@Param('coachId') coachId: number) {
    return this.messagesService.getLastMessagesForCoach(coachId);
  }
}