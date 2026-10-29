
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, TeamMember } from '../models/portal.models';

export interface InvitationDetails {
  id: number;
  name: string | null;
  inviteType: 'CLIENT' | 'TEAM';
  email: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
}

export interface InvitationRegistrationRequest {
  token: string;
  fullName: string;
  email: string;
  password: string;
}

export interface InvitationRegistrationResponse {
  message: string;
  email: string;
  role: string;
}

export interface InvitationOtpRequest {
  token: string;
}

export interface InvitationOtpVerificationRequest {
  token: string;
  otp: string;
}

export interface InvitationOtpResponse {
  message: string;
  verified?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PortalApiService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Clients
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}/clients`, {
      withCredentials: true
    });
  }

  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}/clients`, client, {
      withCredentials: true
    });
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/clients/${id}`, {
      withCredentials: true
    });
  }

  updateClient(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(
      `${this.baseUrl}/clients/${id}`,
      client,
      { withCredentials: true }
    );
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clients/${id}`, {
      withCredentials: true
    });
  }

  // Team members
  getTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.baseUrl}/team-members`, {
      withCredentials: true
    });
  }

  getTeamMemberById(id: number): Observable<TeamMember> {
    return this.http.get<TeamMember>(
      `${this.baseUrl}/team-members/${id}`,
      { withCredentials: true }
    );
  }

  inviteTeamMember(member: TeamMember): Observable<TeamMember> {
    return this.http.post<TeamMember>(
      `${this.baseUrl}/team-members`,
      member,
      { withCredentials: true }
    );
  }

  updateTeamMember(
    id: number,
    member: TeamMember
  ): Observable<TeamMember> {
    return this.http.put<TeamMember>(
      `${this.baseUrl}/team-members/${id}`,
      member,
      { withCredentials: true }
    );
  }

  deleteTeamMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/team-members/${id}`, {
      withCredentials: true
    });
  }

  // Invitations
  validateInvitation(token: string): Observable<InvitationDetails> {
    return this.http.get<InvitationDetails>(
      `${this.baseUrl}/invitations/validate`,
      {
        params: { token },
        withCredentials: true
      }
    );
  }

  // Send an OTP to the invitation email.
  sendInvitationOtp(token: string): Observable<InvitationOtpResponse> {
    const request: InvitationOtpRequest = { token };

    return this.http.post<InvitationOtpResponse>(
      `${this.baseUrl}/invitations/send-otp`,
      request,
      { withCredentials: true }
    );
  }

  // Verify the OTP entered by the invitee.
  verifyInvitationOtp(
    token: string,
    otp: string
  ): Observable<InvitationOtpResponse> {
    const request: InvitationOtpVerificationRequest = {
      token,
      otp: otp.trim()
    };

    return this.http.post<InvitationOtpResponse>(
      `${this.baseUrl}/invitations/verify-otp`,
      request,
      { withCredentials: true }
    );
  }

  registerFromInvitation(
    request: InvitationRegistrationRequest
  ): Observable<InvitationRegistrationResponse> {
    return this.http.post<InvitationRegistrationResponse>(
      `${this.baseUrl}/invitations/register`,
      request,
      { withCredentials: true }
    );
  }
}
