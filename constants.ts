
import { type User, type Project, UserRole } from './types';

export const MOCK_USERS: User[] = [
  { id: 1, name: 'John Doe', phone: '1112223333', pin: '1234', role: UserRole.STAFF },
  { id: 2, name: 'Jane Smith', phone: '4445556666', pin: '5678', role: UserRole.STAFF },
  { id: 3, name: 'Admin User', phone: '9998887777', pin: '0000', role: UserRole.ADMIN },
];

export const MOCK_PROJECTS: Project[] = [
  { id: 101, name: 'Downtown Tower Installation' },
  { id: 102, name: 'Suburb Shopping Mall Setup' },
  { id: 103, name: 'Corporate HQ Renovation' },
];
