import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from './storage.service';
import { FilesController } from './storage.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MulterModule.register({
      storage: multer.memoryStorage(),  // Usamos memoryStorage para almacenar temporalmente en memoria antes de subir a Google Cloud
    }),
  ],
  controllers: [FilesController],
  providers: [StorageService],
  exports: [StorageService], // Exporta el servicio si necesitas utilizarlo en otros módulos
})
export class StorageModule {}