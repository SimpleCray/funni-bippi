import { Injectable } from '@nestjs/common'
import { unlink } from 'fs/promises'
import { join } from 'path'

@Injectable()
export class UploadService {
  private readonly uploadDir = process.env.UPLOAD_DIR ?? (process.platform === 'win32' ? 'C:/tmp/uploads' : '/tmp/uploads')

  async deleteFile(filename: string): Promise<void> {
    try {
      await unlink(join(this.uploadDir, filename))
    } catch {
      // file may already be gone
    }
  }
}
