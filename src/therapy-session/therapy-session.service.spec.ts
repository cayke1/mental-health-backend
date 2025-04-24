import { Test, TestingModule } from '@nestjs/testing';
import { TherapySessionService } from './therapy-session.service';

describe('TherapySessionService', () => {
  let service: TherapySessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TherapySessionService],
    }).compile();

    service = module.get<TherapySessionService>(TherapySessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
