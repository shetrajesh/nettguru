import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { PortalApiService } from '../../services/portal-api.service';
import { EditClientComponent } from './edit-client.component';

describe('EditClientComponent', () => {
  let component: EditClientComponent;
  let fixture: ComponentFixture<EditClientComponent>;

  beforeEach(async () => {
    const api = {
      getClientById: () => of({
        id: 1,
        legalName: 'Example LLC',
        displayName: 'Example',
        businessType: 'Consulting',
        timeZone: 'UTC',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        mobileNumber: '1234567890'
      }),
      updateClient: () => of({})
    };

    await TestBed.configureTestingModule({
      imports: [EditClientComponent],
      providers: [
        { provide: PortalApiService, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } }
        },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the form with the loaded client details', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      '[formControlName="legalName"]'
    );

    expect(component.clientLoaded).toBe(true);
    expect(input.value).toBe('Example LLC');
  });
});
