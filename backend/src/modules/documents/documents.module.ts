import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { StorageService } from '../../shared/services/storage.service';
import { AzureBlobStorageService } from '../../shared/services/azure-blob-storage.service';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    {
      provide: StorageService,
      useClass: AzureBlobStorageService,
    },
  ],
  exports: [DocumentsService],
})
export class DocumentsModule {}
