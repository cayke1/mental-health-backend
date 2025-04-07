import { Test, TestingModule } from '@nestjs/testing';
import { ProfessionalReportsController } from './professional-reports.controller';

describe('ProfessionalReportsController', () => {
  let controller: ProfessionalReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionalReportsController],
    }).compile();

    controller = module.get<ProfessionalReportsController>(
      ProfessionalReportsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
