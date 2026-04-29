import api from "./api";
import type {
  Grade,
  Subject,
  ApiResponse,
  CreateGradeDto,
  Periodo,
} from "../types";

export interface TeacherSubject extends Subject {
  _count?: {
    calificaciones: number;
  };
}

export interface SubjectStudentData {
  materia: {
    id: string;
    nombre: string;
  };
  curso: {
    id: string;
    nombre: string;
    anio: number;
  };
  alumnos: Array<{
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
    calificaciones: Record<
      Periodo,
      { id: string; nota: number; observaciones: string | null }
    >;
  }>;
}

export interface StudentInfo {
  inscripcion: {
    id: string;
    anio: number;
    curso: {
      id: string;
      nombre: string;
      turno: string;
    };
  } | null;
  materias?: Array<{
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
      periodo: Periodo;
      observaciones?: string;
    }>;
    promedio: number | null;
  }>;
  mensaje?: string;
}

export const gradeService = {
  async getGrades(params?: {
    materiaId?: string;
    alumnoId?: string;
    periodo?: Periodo;
  }): Promise<Grade[]> {
    const response = await api.get<ApiResponse<Grade[]>>("/grades", { params });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al obtener calificaciones");
  },

  async createGrade(data: CreateGradeDto): Promise<Grade> {
    const response = await api.post<ApiResponse<Grade>>("/grades", data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al crear calificación");
  },

  async updateGrade(
    id: string,
    data: { nota?: number; observaciones?: string },
  ): Promise<Grade> {
    const response = await api.put<ApiResponse<Grade>>(`/grades/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al actualizar calificación");
  },

  async deleteGrade(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/grades/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Error al eliminar calificación");
    }
  },

  // Teacher endpoints
  async getTeacherSubjects(): Promise<TeacherSubject[]> {
    const response = await api.get<ApiResponse<TeacherSubject[]>>(
      "/grades/teacher/subjects",
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al obtener materias");
  },

  async getSubjectStudents(materiaId: string): Promise<SubjectStudentData> {
    const response = await api.get<ApiResponse<SubjectStudentData>>(
      `/grades/teacher/subjects/${materiaId}/students`,
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(
      response.data.error || "Error al obtener alumnos de materia",
    );
  },

  // Student endpoints
  async getStudentInfo(): Promise<StudentInfo> {
    const response = await api.get<ApiResponse<StudentInfo>>(
      "/grades/student/info",
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al obtener información");
  },
};
