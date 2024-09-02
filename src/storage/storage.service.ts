import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.storage = new Storage({
      projectId: this.configService.get<string>('GCLOUD_PROJECT_ID'),
      keyFilename: this.configService.get<string>('GCLOUD_KEYFILE_PATH'),
    });
    this.bucketName = this.configService.get<string>('GCLOUD_BUCKET_NAME');
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string; mimeType: string }> {
    const outputFilePath = path.join(__dirname, `../../../uploads/${Date.now()}-${file.originalname}`);
    
    // Guardar el archivo temporalmente
    fs.writeFileSync(outputFilePath, file.buffer);

    // Subir el archivo a Google Cloud Storage
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(path.basename(outputFilePath));
    const blobStream = blob.createWriteStream({
      resumable: false,
      gzip: true,
    });

    return new Promise<{ url: string; mimeType: string }>((resolve, reject) => {
      blobStream.on('error', (err) => reject(err));
      blobStream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve({ url: publicUrl, mimeType: file.mimetype });

        // Elimina el archivo temporal después de subirlo
        fs.unlink(outputFilePath, (err) => {
          if (err) {
            console.error('Error deleting temp file:', err);
          }
        });
      });
      fs.createReadStream(outputFilePath).pipe(blobStream);
    });
  }
}