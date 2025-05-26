export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: 'PATIENT' | 'PROFESSIONAL';
}

export interface CreatePatientDto {
  name: string;
  email: string;
  password: string;
  role?: string;
  professional_id: string;
  invite_id: string;
}
