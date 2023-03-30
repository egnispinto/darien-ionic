import { TestBed } from '@angular/core/testing';

import { ConnectBackofficeService } from './servicio-de-producto.service';

describe('ConnectBackofficeService', () => {
  let service: ConnectBackofficeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectBackofficeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
