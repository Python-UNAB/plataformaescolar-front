import api from "./api";
import type { Subject, ApiResponse, CreateSubjectDto } from "../types";

export const subjectService = {
  async getSubjects(params?: {
    cursoId?: string;
    activo?: boolean;
  }): Promise<Subject[]> {
    const response = await api.get<ApiResponse<Subject[]>>("/subjects", {
      params,
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al obtener materias");
  },

  async getSubjectById(id: string): Promise<Subject> {
    const response = await api.get<ApiResponse<Subject>>(`/subjects/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al obtener materia");
  },

  async createSubject(data: CreateSubjectDto): Promise<Subject> {
    const response = await api.post<ApiResponse<Subject>>("/subjects", data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al crear materia");
  },

  async updateSubject(
    id: string,
    data: Partial<CreateSubjectDto & { activo?: boolean }>,
  ): Promise<Subject> {
    const response = await api.put<ApiResponse<Subject>>(
      `/subjects/${id}`,
      data,
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al actualizar materia");
  },

  async deleteSubject(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/subjects/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Error al eliminar materia");
    }
  },
};
