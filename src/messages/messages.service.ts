import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async sendMessage(sender: User, receiver: User, content: string, fileUrl: string, fileType: string): Promise<Message> {
    const message = this.messageRepository.create({
      sender,
      receiver,
      content,
      fileUrl,
      fileType,
    });
    return await this.messageRepository.save(message);
  }

  async getMessagesBetweenUsers(user1: User, user2: User, limit: number, page: number): Promise<Message[]> {
    console.log('user1', user1);  
    console.log('user2', user2);
    console.log('limit', limit);
    console.log('page', page);
    return await this.messageRepository.find({
      where: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
      order: { timestamp: 'DESC' },
      relations: ['sender', 'receiver'],
      take: limit,
      skip: limit * (page - 1),
    });
  }

  async markAsRead(messageId: number): Promise<void> {
    await this.messageRepository.update(messageId, { isRead: true });
  }

  async getLastMessagesForCoach(coachId: number): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { receiver: { id: coachId } },
      order: { timestamp: 'DESC' },
      take: 3,
      relations: ['sender', 'receiver', 'sender.client'],
    });
  }
}