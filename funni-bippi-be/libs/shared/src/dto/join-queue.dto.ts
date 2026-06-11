import { IsIn, IsString, IsUUID } from 'class-validator';

export class JoinQueueDto {
  @IsIn(['male', 'female'])
  gender: 'male' | 'female';

  @IsIn(['everyone', 'male', 'female'])
  interest: 'everyone' | 'male' | 'female';

  @IsString()
  @IsUUID()
  sessionId: string;
}
