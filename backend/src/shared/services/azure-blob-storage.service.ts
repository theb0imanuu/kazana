import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient } from '@azure/storage-blob';
import { StorageService } from './storage.service';

@Injectable()
export class AzureBlobStorageService extends StorageService {
  private blobServiceClient: BlobServiceClient | null = null;
  private containerName: string | null = null;

  constructor(private configService: ConfigService) {
    super();
    const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');
    const container = this.configService.get<string>('AZURE_STORAGE_CONTAINER');

    if (connectionString && container) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      this.containerName = container;
    }
  }

  async upload(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    path: string,
  ): Promise<string> {
    if (!this.blobServiceClient || !this.containerName) {
      throw new InternalServerErrorException(
        'Azure Blob Storage is not configured. Please set AZURE_STORAGE_CONNECTION_STRING and AZURE_STORAGE_CONTAINER in your environment.',
      );
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(path);

      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        },
      });

      return blockBlobClient.url;
    } catch (error) {
      throw new InternalServerErrorException(`Azure Blob Storage upload failed: ${(error as Error).message}`);
    }
  }

  async delete(url: string): Promise<void> {
    if (!this.blobServiceClient || !this.containerName) {
      throw new InternalServerErrorException(
        'Azure Blob Storage is not configured. Please set AZURE_STORAGE_CONNECTION_STRING and AZURE_STORAGE_CONTAINER in your environment.',
      );
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const urlObj = new URL(url);
      const pathname = decodeURIComponent(urlObj.pathname);
      const containerPrefix = `/${this.containerName}/`;
      const blobName = pathname.startsWith(containerPrefix)
        ? pathname.substring(containerPrefix.length)
        : pathname.split('/').slice(2).join('/');

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.deleteIfExists();
    } catch (error) {
      throw new InternalServerErrorException(`Azure Blob Storage deletion failed: ${(error as Error).message}`);
    }
  }
}
