import { TestBed } from '@angular/core/testing';

import { CrawlService } from './crawl.service';

describe('CrawlService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CrawlService = TestBed.get(CrawlService);
    expect(service).toBeTruthy();
  });
});
