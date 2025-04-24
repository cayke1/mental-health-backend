export interface TherapySessionDto {
  id: number;
  professionalPatientId: string;
  done?: boolean;
  confirmed?: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTherapySessionDto {
  professionalPatientId: string;
  startDate: Date;
  endDate: Date;
}
