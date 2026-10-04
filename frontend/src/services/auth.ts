import { apiClient } from "./api";
import { ApiResponse } from "@/types";
import { User } from "@/types/auth";

export async function loginApi(identifier: string, password: string) {
  const res = await apiClient.post<ApiResponse<any>>("/auth/login", {
    identifier,
    password,
  });
  return res.data.data;
}

export async function registerApi(data: any) {
  const res = await apiClient.post<ApiResponse<any>>("/auth/register", data);
  return res.data.data;
}

export async function getMeApi(): Promise<User> {
  const res = await apiClient.get<ApiResponse<User>>("/auth/me");
  return res.data.data;
}

export async function logoutApi() {
  const res = await apiClient.post<ApiResponse<any>>("/auth/logout");
  return res.data.data;
}
