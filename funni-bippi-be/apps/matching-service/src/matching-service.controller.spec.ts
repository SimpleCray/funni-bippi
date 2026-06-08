import { Test, TestingModule } from '@nestjs/testing';
import { MatchingServiceController } from './matching-service.controller';
import { MatchingServiceService } from './matching-service.service';

describe('MatchingServiceController', () => {
  let matchingServiceController: MatchingServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MatchingServiceController],
      providers: [MatchingServiceService],
    }).compile();

    matchingServiceController = app.get<MatchingServiceController>(
      MatchingServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(matchingServiceController.getHello()).toBe('Hello World!');
    });
  });
});
