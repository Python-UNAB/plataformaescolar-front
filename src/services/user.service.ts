import api from "./api";
import type {
  User,
  ApiResponse,
  PaginatedResponse,
  CreateUserDto,
  Role,
} from "../types";

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  role?: Role;
  search?: string;
  activo?: boolean;
}

export const userService = {
  async getUsers(params?: UsersQueryParams): Promise<PaginatedResponse<User>> {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>(
      "/users",
      { params },
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al obtener usuarios");
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al obtener usuario");
  },

  async createUser(data: CreateUserDto): Promise<User> {
    const response = await api.post<ApiResponse<User>>("/users", data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al crear usuario");
  },

  async updateUser(
    id: string,
    data: Partial<CreateUserDto & { activo?: boolean }>,
  ): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al actualizar usuario");
  },

  async deleteUser(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/users/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Error al eliminar usuario");
    }
  },

  async getDocentes(): Promise<
    Pick<User, "id" | "nombre" | "apellido" | "email">[]
  > {
    const response =
      await api.get<
        ApiResponse<Pick<User, "id" | "nombre" | "apellido" | "email">[]>
      >("/users/docentes");
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al obtener docentes");
  },

  async getAlumnos(
    search?: string,
  ): Promise<Pick<User, "id" | "nombre" | "apellido" | "dni" | "email">[]> {
    const response = await api.get<
      ApiResponse<Pick<User, "id" | "nombre" | "apellido" | "dni" | "email">[]>
    >("/users/alumnos", {
      params: { search },
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al obtener alumnos");
  },
};
