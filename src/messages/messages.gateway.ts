import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Configura esto según sea necesario para tu aplicación
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService, 
    private readonly usersService: UserService
    ) {}

    async handleConnection(client: Socket) {
      // Autenticar el usuario, por ejemplo, usando JWT
      try {
        const token = client.handshake.auth.token; // Extrae el token del header Authorization

        const user = await this.usersService.findByToken(token); // Encuentra al usuario por token
        if (user) {
          client.join(user.id.toString()); // Asocia el socket con el ID del usuario
          console.log(`Client connected: ${client.id} as user ${user.id}`);
        } else {
          console.error('Unauthorized connection');
          client.disconnect();
        }
      } catch (error) {
        console.error('Connection error:', error.message);
        client.disconnect();
      }
    }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { senderId: number, receiverId: number, content: string, fileUrl: string, fileType: string }) {
    console.log('sendMessage', payload);
    const { senderId, receiverId, content, fileUrl, fileType } = payload;
    const sender = await this.usersService.findOne(senderId); // Implementa este método
    const receiver = await this.usersService.findOne(receiverId); // Implementa este método

    const message = await this.messagesService.sendMessage(sender, receiver, content, fileUrl, fileType);

    // Emitir el mensaje a ambos usuarios
    console.log('Emitting message to', sender.id, receiver.id);
    this.server.to(receiver.id.toString()).emit('receiveMessage', message);
    this.server.to(sender.id.toString()).emit('receiveMessage', message);
  }

}