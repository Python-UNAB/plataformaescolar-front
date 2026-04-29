import api from "./api";
import type { Enrollment, ApiResponse, CreateEnrollmentDto } from "../types";

export interface StudentHistory {
  alumno: {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    role: string;
  };
  historial: Array<{
    id: string;
    anio: number;
    activo: boolean;
    curso: {
      id: string;
      nombre: string;
      materias: Array<{
        id: string;
        nombre: string;
        docente?: {
          id: string;
          nombre: string;
          apellido: string;
        };
        calificaciones: Array<{
          id: string;
          nota: number;
          periodo: string;
          observaciones?: string;
        }>;
      }>;
    };
  }>;
}

export const enrollmentService = {
  async getEnrollments(params?: {
    cursoId?: string;
    alumnoId?: string;
    anio?: number;
    activo?: boolean;
  }): Promise<Enrollment[]> {
    const response = await api.get<ApiResponse<Enrollment[]>>("/enrollments", {
      params,
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al obtener inscripciones");
  },

  async createEnrollment(data: CreateEnrollmentDto): Promise<Enrollment> {
    const response = await api.post<ApiResponse<Enrollment>>(
      "/enrollments",
      data,
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al crear inscripción");
  },

  async deleteEnrollment(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/enrollments/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Error al eliminar inscripción");
    }
  },

  async getStudentHistory(studentId: string): Promise<StudentHistory> {
    const response = await api.get<ApiResponse<StudentHistory>>(
      `/enrollments/history/${studentId}`,
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al obtener historial");
  },
};
