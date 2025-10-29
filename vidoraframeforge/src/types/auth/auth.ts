export interface SignUpFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

export interface LoginFormData {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginFormErrors {
  emailOrUsername?: string;
  password?: string;
  general?: string;
}
