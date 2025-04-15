import apiClient from '../config/api';
import { LoginRequest, RefreshTokenRequest, TokenResponse } from '../types/authTypes';
import { UserCreate, UserRead } from '../types/userTypes';
import { HTTPValidationError } from '../types/api';
import { AxiosError } from 'axios';

export const registerUser = async (
  userData: UserCreate
): Promise<UserRead> => {
  try {
    const response = await apiClient.post<UserRead>('/auth/register', userData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<HTTPValidationError>;
    // Consider more specific error handling or re-throwing
    console.error('Registration failed:', axiosError.response?.data);
    throw axiosError;
  }
};

export const loginUser = async (
  credentials: LoginRequest
): Promise<TokenResponse> => {
  try {
    // FastAPI OAuth2PasswordRequestForm expects form data
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiClient.post<TokenResponse>('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<HTTPValidationError>;
    console.error('Login failed:', axiosError.response?.data);
    throw axiosError;
  }
};

export const refreshToken = async (
  tokenData: RefreshTokenRequest
): Promise<TokenResponse> => {
  try {
    const response = await apiClient.post<TokenResponse>('/auth/refresh', tokenData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<HTTPValidationError>;
    console.error('Token refresh failed:', axiosError.response?.data);
    throw axiosError;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    // Backend might not have a specific endpoint needing a call,
    // but if it does (e.g., to invalidate refresh token server-side):
    await apiClient.post('/auth/logout');
    // Client-side logout (clearing store) is handled separately in the store action
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Logout API call failed (if applicable):', axiosError.response?.data);
    // Don't necessarily throw, as client-side logout should still proceed
  }
}; 