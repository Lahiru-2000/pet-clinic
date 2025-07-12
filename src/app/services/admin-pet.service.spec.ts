import { TestBed } from '@angular/core/testing';

import { AdminPetService } from './admin-pet.service';

describe('AdminPetService', () => {
  let service: AdminPetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminPetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
}); 