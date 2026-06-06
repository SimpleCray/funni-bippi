import { IsString, IsUUID } from 'class-validator'

export class UploadImageDto {
  @IsString()
  @IsUUID()
  roomId: string
}
