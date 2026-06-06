import { Module } from '@nestjs/common';
import { MatchingServiceController } from './matching-service.controller';
import { MatchingServiceService } from './matching-service.service';

@Module({
  imports: [],
  controllers: [MatchingServiceController],
  providers: [MatchingServiceService],
})
export class MatchingServiceModule {}
