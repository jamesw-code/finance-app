import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateBusinessDialog } from './create-business-dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { BusinessService } from '../services/business.service';
import { of } from 'rxjs';

describe('CreateBusinessDialog', () => {
  let component: CreateBusinessDialog;
  let fixture: ComponentFixture<CreateBusinessDialog>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CreateBusinessDialog>>;
  let businessServiceSpy: jasmine.SpyObj<BusinessService>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    businessServiceSpy = jasmine.createSpyObj('BusinessService', ['createBusiness']);
    businessServiceSpy.createBusiness.and.returnValue(of({ id: 1, name: 'Test Business' }));

    await TestBed.configureTestingModule({
      imports: [CreateBusinessDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: BusinessService, useValue: businessServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBusinessDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
