import api from "./api";
import type { Course, ApiResponse, CreateCourseDto } from "../types";

export const courseService = {
  async getCourses(params?: {
    anio?: number;
    activo?: boolean;
  }): Promise<Course[]> {
    const response = await api.get<ApiResponse<Course[]>>("/courses", {
      params,
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al obtener cursos");
  },

  async getCourseById(
    id: string,
  ): Promise<Course & { materias: unknown[]; inscripciones: unknown[] }> {
    const response = await api.get<
      ApiResponse<Course & { materias: unknown[]; inscripciones: unknown[] }>
    >(`/courses/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al obtener curso");
  },

  async createCourse(data: CreateCourseDto): Promise<Course> {
    const response = await api.post<ApiResponse<Course>>("/courses", data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al crear curso");
  },

  async updateCourse(
    id: string,
    data: Partial<CreateCourseDto & { activo?: boolean }>,
  ): Promise<Course> {
    const response = await api.put<ApiResponse<Course>>(`/courses/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al actualizar curso");
  },

  async deleteCourse(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/courses/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Error al eliminar curso");
    }
  },
};
