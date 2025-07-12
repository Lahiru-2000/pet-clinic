import { TestBed } from '@angular/core/testing';

import { AdminClientService } from './admin-client.service';

describe('AdminClientService', () => {
  let service: AdminClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
}); 