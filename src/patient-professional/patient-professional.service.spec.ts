import { Test, TestingModule } from '@nestjs/testing';
import { PatientProfessionalService } from './patient-professional.service';

describe('PatientProfessionalService', () => {
  let service: PatientProfessionalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientProfessionalService],
    }).compile();

    service = module.get<PatientProfessionalService>(
      PatientProfessionalService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
