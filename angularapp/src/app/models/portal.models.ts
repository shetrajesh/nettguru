export interface Client {
  id?: number;
  legalName: string;
  displayName: string;
  businessType: string;
  timeZone: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  primaryAssociate?: string;
  backupAssociate?: string;
  stage?: string;
  status?: string;
  dueDate?: string;
  openItems?: number;
  lastActivity?: string;
  invitationStatus?: string;
  createdAt?: string;
  deleted?: boolean;
}


export interface TeamMember {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status?: string;
  lastSignIn?: string;
  invitationStatus?: string;
  createdAt?: string;
}
