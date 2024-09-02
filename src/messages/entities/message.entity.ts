import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.sentMessages)
  sender: User;

  @ManyToOne(() => User, user => user.receivedMessages)
  receiver: User;

  @Column()
  content: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  fileType: string;

  @Column({ default: false })
  isRead: boolean;
}