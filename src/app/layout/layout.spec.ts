import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Layout } from './layout';
import { BusinessService } from '../services/business.service';

describe('Layout', () => {
  let component: Layout;
  let fixture: ComponentFixture<Layout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layout],
      providers: [
        {
          provide: BusinessService,
          useValue: { selectedBusiness$: of(null) }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Layout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
