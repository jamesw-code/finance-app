import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBusinessDialog } from './create-business-dialog';

describe('CreateBusinessDialog', () => {
  let component: CreateBusinessDialog;
  let fixture: ComponentFixture<CreateBusinessDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBusinessDialog]
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
