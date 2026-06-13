export interface UserProfile {
  id: string;
  name: string;
  email: string;
  twoFactorEnabled?: boolean;
}

export interface UpdateUserNameRequest {
  name: string;
}

export interface UpdateUserEmailRequest {
  email: string;
  twoFactorCode?: string;
}

export interface UpdateUserPasswordRequest {
  currentPassword: string;
  newPassword: string;
  twoFactorCode?: string;
}
