import { Role, User } from './user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  roles: Role[];
  user: User;
}

export interface AccessTokenResponse {
  accessToken: string;
}
