import api from "./api";
import type {
  LoginCredentials,
  AuthResponse,
  User,
  ApiResponse,
} from "../types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials,
    );
    if (response.data.success && response.data.data) {
      const { token, user } = response.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al iniciar sesión");
  },

  async me(): Promise<User> {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || "Error al obtener usuario");
  },

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  getStoredUser(): User | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },
};
