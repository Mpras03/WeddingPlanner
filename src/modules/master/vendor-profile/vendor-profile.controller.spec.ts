import { Test, TestingModule } from '@nestjs/testing';
import { VendorProfileController } from './vendor-profile.controller';

describe('VendorProfileController', () => {
  let controller: VendorProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorProfileController],
    }).compile();

    controller = module.get<VendorProfileController>(VendorProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
