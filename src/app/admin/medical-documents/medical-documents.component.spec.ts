import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalDocumentsComponent } from './medical-documents.component';

describe('MedicalDocumentsComponent', () => {
  let component: MedicalDocumentsComponent;
  let fixture: ComponentFixture<MedicalDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalDocumentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 