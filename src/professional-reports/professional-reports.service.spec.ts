import { Test, TestingModule } from '@nestjs/testing';
import { ProfessionalReportsService } from './professional-reports.service';

describe('ProfessionalReportsService', () => {
  let service: ProfessionalReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfessionalReportsService],
    }).compile();

    service = module.get<ProfessionalReportsService>(ProfessionalReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
