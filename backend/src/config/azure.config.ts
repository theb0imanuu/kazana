import { registerAs } from '@nestjs/config';

export default registerAs('azure', () => ({
  storageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  storageContainer: process.env.AZURE_STORAGE_CONTAINER ?? 'documents',
  maxUploadSizeBytes: Number(process.env.MAX_UPLOAD_SIZE_BYTES ?? 10 * 1024 * 1024),
}));
