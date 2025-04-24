import { Test, TestingModule } from '@nestjs/testing';
import { TherapySessionController } from './therapy-session.controller';

describe('TherapySessionController', () => {
  let controller: TherapySessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TherapySessionController],
    }).compile();

    controller = module.get<TherapySessionController>(TherapySessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
