// User roles
export type Role =
  | "DIRECTIVO"
  | "SECRETARIO"
  | "PRECEPTOR"
  | "DOCENTE"
  | "ALUMNO";

// Turno enum
export type Turno = "MANANA" | "TARDE" | "NOCHE";

// Periodo enum
export type Periodo =
  | "PRIMER_TRIMESTRE"
  | "SEGUNDO_TRIMESTRE"
  | "TERCER_TRIMESTRE"
  | "FINAL";

// User interface
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  dni: string;
  role: Role;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Auth interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Course interface
export interface Course {
  id: string;
  nombre: string;
  anio: number;
  turno: Turno;
  activo: boolean;
  _count?: {
    inscripciones: number;
    materias: number;
  };
}

// Subject interface
export interface Subject {
  id: string;
  nombre: string;
  cursoId: string;
  docenteId?: string;
  activo: boolean;
  curso?: {
    id: string;
    nombre: string;
    anio: number;
    turno?: Turno;
  };
  docente?: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

// Enrollment interface
export interface Enrollment {
  id: string;
  alumnoId: string;
  cursoId: string;
  anio: number;
  activo: boolean;
  alumno?: {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
  };
  curso?: Course;
}

// Grade interface
export interface Grade {
  id: string;
  alumnoId: string;
  materiaId: string;
  nota: number;
  periodo: Periodo;
  fecha: string;
  observaciones?: string;
  alumno?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  materia?: {
    id: string;
    nombre: string;
  };
}

// API Response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination interface
export interface PaginatedResponse<T> {
  users: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Create user DTO
export interface CreateUserDto {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni: string;
  role: Role;
}

// Create course DTO
export interface CreateCourseDto {
  nombre: string;
  anio: number;
  turno: Turno;
}

// Create subject DTO
export interface CreateSubjectDto {
  nombre: string;
  cursoId: string;
  docenteId?: string;
}

// Create enrollment DTO
export interface CreateEnrollmentDto {
  alumnoId: string;
  cursoId: string;
  anio: number;
}

// Create grade DTO
export interface CreateGradeDto {
  alumnoId: string;
  materiaId: string;
  nota: number;
  periodo: Periodo;
  observaciones?: string;
}
