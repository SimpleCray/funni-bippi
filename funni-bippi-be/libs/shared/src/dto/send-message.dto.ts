import {
  IsString,
  IsUUID,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MaxLength(2000)
  text: string;

  @IsString()
  @IsUUID()
  roomId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  messageId?: string;
}

export class SendImageDto {
  @IsString()
  @Matches(/^\/files\/[\w.-]+$/)
  imageUrl: string;

  @IsString()
  @IsUUID()
  roomId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  messageId?: string;
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

export class ReactionDto {
  @IsString()
  @IsUUID()
  messageId: string;

  @IsString()
  @IsUUID()
  roomId: string;

  @IsString()
  @MaxLength(8)
  emoji: string;
}
