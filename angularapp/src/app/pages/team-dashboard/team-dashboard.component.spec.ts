import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TeamDashboardComponent } from "./team-dashboard.component";

describe("TeamDashboardComponent", () => {
  let component: TeamDashboardComponent;
  let fixture: ComponentFixture<TeamDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
