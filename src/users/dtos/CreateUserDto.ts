export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface CreatePatientDto {
  name: string;
  email: string;
  password: string;
  role?: string;
  professional_id: string;
}
