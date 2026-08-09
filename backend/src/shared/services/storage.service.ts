export abstract class StorageService {
  abstract upload(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    path: string,
  ): Promise<string>;

  abstract delete(url: string): Promise<void>;
}
