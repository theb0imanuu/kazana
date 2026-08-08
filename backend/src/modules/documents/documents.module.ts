import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { BlobStorageService } from './blob-storage.service';
@Module({ controllers: [DocumentsController], providers: [DocumentsService, BlobStorageService], exports: [DocumentsService] })
export class DocumentsModule {}
