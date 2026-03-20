import { TestBed } from '@angular/core/testing';

import { Xano } from './xano';

describe('Xano', () => {
  let service: Xano;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Xano);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
