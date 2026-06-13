export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  twoFactorEnabled?: boolean;
}

export interface SessionUserResponse {
  id: string;
  name: string;
  email: string;
  twoFactorEnabled?: boolean;
}

export interface CreateAccountRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TwoFactorLoginRequest {
  twoFactorToken: string;
  code: string;
}

export interface TwoFactorRequiredResponse {
  requiresTwoFactor: true;
  twoFactorToken: string;
}

export type LoginResponse = AuthenticatedUser | TwoFactorRequiredResponse;

export interface EnableTwoFactorResponse {
  secret: string;
  optAuthUrl: string;
}

export interface ActivationContext {
  email: string;
  password: string;
}
