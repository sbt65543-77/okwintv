import type { User } from "@/models/types";
import env from "@/configs/env";
import { Axios } from "./Axios";

export type OtpPurpose = "login" | "register";

export interface RequestOtpPayload {
  identifier: string;
  purpose: OtpPurpose;
}

export interface RequestOtpResponse {
  channel: "email" | "phone";
  expiresIn: number;
  debugCode?: string;
}

export interface VerifyOtpPayload extends RequestOtpPayload {
  code: string;
  password?: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  user: User;
}

export interface LoginWithPasswordPayload {
  password: string;
  username: string;
}

export interface RegisterWithPasswordPayload {
  phone: string;
  password: string;
  username: string;
}

export type AuthResponse = VerifyOtpResponse;

export interface UserProfile extends User {
  bio?: string;
  coverUrl?: string;
  gender?: string;
  province?: string;
  birthday?: string;
  birthDay?: string;
  birthMonth?: string;
  birthYear?: string;
}

export interface UpdateProfilePayload {
  avatarUrl?: string;
  bio?: string;
  birthday?: string;
  coverUrl?: string;
  gender?: string;
  name?: string;
  phone?: string;
  province?: string;
}

export const loginWithPassword = async (payload: LoginWithPasswordPayload) => {
  const response = await Axios(false).post<AuthResponse>("/auth/client/login", payload);

  return response.data;
};

export const registerWithPassword = async (
  payload: RegisterWithPasswordPayload,
) => {
  const response = await Axios(false).post<AuthResponse>("/auth/client/register", payload);

  return response.data;
};

export const getMe = async () => {
  const response = await Axios(true).get<User>("/auth/me");

  return response.data;
};

export const getProfile = async () => {
  const response = await Axios(true).get<UserProfile>("/auth/me");

  return response.data;
};

export const updateProfile = async (payload: UpdateProfilePayload) => {
  const response = await Axios(true).patch<UserProfile>("/auth/profile", payload);

  return response.data;
};

export const uploadProfileImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await Axios(true, env.apiEndPoint || env.serverApiEndPoint).post<{
    url: string;
  }>("/uploads/profile-image", formData);

  return response.data;
};

export const logout = async () => {
  const response = await Axios(true).post<{ success: boolean }>("/auth/logout");

  return response.data;
};

export const requestOtp = async (payload: RequestOtpPayload) => {
  const response = await Axios(false).post<RequestOtpResponse>("/auth/request-otp", payload);

  return response.data;
};

export const verifyOtp = async (payload: VerifyOtpPayload) => {
  const response = await Axios(false).post<VerifyOtpResponse>("/auth/verify-otp", payload);

  return response.data;
};
