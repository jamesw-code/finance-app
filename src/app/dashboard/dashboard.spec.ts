import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { MatDialog } from '@angular/material/dialog';
import { BusinessService } from '../services/business.service';
import { of } from 'rxjs';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let businessServiceSpy: jasmine.SpyObj<BusinessService>;

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue({ afterClosed: () => of(null) } as any);
    businessServiceSpy = jasmine.createSpyObj(
      'BusinessService',
      ['getBusinesses', 'setSelectedBusiness', 'getSelectedBusiness'],
      { selectedBusiness$: of(null) }
    );
    businessServiceSpy.getBusinesses.and.returnValue(of([]));
    businessServiceSpy.getSelectedBusiness.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: MatDialog, useValue: dialogSpy },
        { provide: BusinessService, useValue: businessServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
