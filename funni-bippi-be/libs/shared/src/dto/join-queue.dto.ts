import { IsIn, IsString, IsUUID } from 'class-validator'

export class JoinQueueDto {
  @IsIn(['everyone', 'male', 'female'])
  gender: 'everyone' | 'male' | 'female'

  @IsString()
  @IsUUID()
  sessionId: string
}
