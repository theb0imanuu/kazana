import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { randomUUID } from 'crypto';

@Injectable()
export class BlobStorageService {
  private readonly connectionString: string | undefined;
  private readonly containerName: string;

  constructor(config: ConfigService) {
    this.connectionString = config.get<string>('AZURE_STORAGE_CONNECTION_STRING');
    this.containerName = config.get<string>('AZURE_STORAGE_CONTAINER', 'documents');
  }

  async upload(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string; blobName: string }> {
    try {
      if (!this.connectionString) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING is not configured');
      }

      const client = BlobServiceClient.fromConnectionString(this.connectionString);
      const container = client.getContainerClient(this.containerName);
      await container.createIfNotExists();

      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const blobName = `${userId}/${randomUUID()}-${safeName}`;
      const blockBlob = container.getBlockBlobClient(blobName);

      await blockBlob.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });

      return { url: blockBlob.url, blobName };
    } catch {
      throw new InternalServerErrorException('Failed to upload document');
    }
  }
}
