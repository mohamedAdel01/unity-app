export interface User {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  firstNameAr?: string;
  lastNameAr?: string;
  avatar?: string;
  role: string;
  roleAr?: string;
  branchId?: string;
  branch?: Branch;
  patientId?: string;
  doctorId?: string;
}

export interface Branch {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  departments?: Department[];
}

export interface Department {
  id: string;
  branchId: string;
  name: string;
  nameAr: string;
  code: string;
  description?: string;
  icon?: string;
  clinics?: Clinic[];
}

export interface Clinic {
  id: string;
  departmentId: string;
  name: string;
  nameAr: string;
  code: string;
  roomNumber?: string;
  floor?: string;
  maxDailyAppointments: number;
  defaultSlotDuration: number;
  isActive: boolean;
  department?: Department;
}

export interface Doctor {
  id: string;
  userId: string;
  licenseNumber?: string;
  title?: string;
  bio?: string;
  bioAr?: string;
  yearsOfExperience?: number;
  consultationFee: number;
  followUpFee?: number;
  rating?: number;
  totalRatings: number;
  user?: User;
  specialties?: { id: string; name: string; nameAr: string; isPrimary: boolean }[];
  schedules?: DoctorSchedule[];
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  clinicId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  clinic?: Clinic;
}

export type AppointmentType = 'SCHEDULED' | 'QUEUE' | 'WALK_IN';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'WAITING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

export interface Appointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  doctorId: string;
  clinicId: string;
  branchId: string;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduledDate: string;
  scheduledTime?: string;
  checkInTime?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  patient?: {
    id: string;
    mrn: string;
    user: User;
  };
  doctor?: Doctor;
  clinic?: Clinic;
  branch?: Branch;
  queueEntry?: QueueEntry;
  invoice?: {
    id: string;
    invoiceNumber: string;
    total: number;
    status: string;
  };
}

export interface QueueEntry {
  id: string;
  appointmentId: string;
  clinicId: string;
  queueNumber: number;
  position: number;
  status: 'WAITING' | 'CALLED' | 'SERVING' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';
  calledAt?: string;
  estimatedWaitMinutes?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
    messageAr?: string;
  };
}

