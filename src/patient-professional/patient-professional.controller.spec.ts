import { Test, TestingModule } from '@nestjs/testing';
import { PatientProfessionalController } from './patient-professional.controller';

describe('PatientProfessionalController', () => {
  let controller: PatientProfessionalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientProfessionalController],
    }).compile();

    controller = module.get<PatientProfessionalController>(PatientProfessionalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
