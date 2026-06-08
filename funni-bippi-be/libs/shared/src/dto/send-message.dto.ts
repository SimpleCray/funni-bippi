import {
  IsString,
  IsUUID,
  MaxLength,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MaxLength(2000)
  text: string;

  @IsString()
  @IsUUID()
  roomId: string;
}

export class SendImageDto {
  @IsString()
  @IsUrl()
  imageUrl: string;

  @IsString()
  @IsUUID()
  roomId: string;
}

export class TypingDto {
  @IsString()
  @IsUUID()
  roomId: string;

  @IsOptional()
  typing: boolean;
}

export class LeaveRoomDto {
  @IsString()
  @IsUUID()
  roomId: string;
}

export class ReportDto {
  @IsString()
  @IsUUID()
  roomId: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
