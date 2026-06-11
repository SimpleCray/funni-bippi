import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { UploadService } from './upload.service';
import { existsSync, mkdirSync } from 'fs';

const uploadDir =
  process.env.UPLOAD_DIR ??
  (process.platform === 'win32' ? 'C:/tmp/uploads' : '/tmp/uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

const MIME_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req, file, cb) => {
          let ext = extname(file.originalname);
          if (!ext) ext = MIME_EXT[file.mimetype] ?? '.png';
          cb(null, `${uuid()}${ext}`);
        },
      }),
      limits: {
        fileSize: Number(process.env.MAX_FILE_SIZE_MB ?? 5) * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only images allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return { imageUrl: `/files/${file.filename}` };
  }
}
