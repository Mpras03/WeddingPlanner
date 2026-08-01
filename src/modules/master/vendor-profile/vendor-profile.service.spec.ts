import { Test, TestingModule } from '@nestjs/testing';
import { VendorProfileService } from './vendor-profile.service';

describe('VendorProfileService', () => {
  let service: VendorProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VendorProfileService],
    }).compile();

    service = module.get<VendorProfileService>(VendorProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
