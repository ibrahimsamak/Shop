export type Role = 'admin' | 'manager' | 'viewer';

export interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
  roles: Role[];
}

export interface UserCreate {
  name: string;
  email: string;
  active?: boolean;
  roles?: Role[];
}

export interface UserUpdate {
  name?: string;
  email?: string;
  active?: boolean;
  roles?: Role[];
}
