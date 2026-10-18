import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, TeamMember } from '../models/portal.models';

@Injectable({ providedIn: 'root' })
export class PortalApiService {
  // Change this URL to match your Spring Boot server.
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}/clients`);
  }

  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}/clients`, client);
  }

  getTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.baseUrl}/team-members`);
  }

  inviteTeamMember(member: TeamMember): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.baseUrl}/team-members`, member);
  }
}
