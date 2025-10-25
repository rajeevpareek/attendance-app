
export enum UserRole {
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
}

export interface User {
  id: number;
  name: string;
  phone: string;
  // PIN is removed for security. Frontend should not hold this.
  role: UserRole;
}

export interface Project {
  id: number;
  name: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface AttendanceRecord {
  id: string;
  userId: number;
  projectId: number | null;
  inTime: string;
  outTime: string | null;
  inCoordinates: Coordinates;
  outCoordinates: Coordinates | null;
}