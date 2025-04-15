import apiClient from '../config/api';
import { UserRead, UserUpdate, UserPasswordUpdate } from '../types/userTypes';
import { HTTPValidationError } from '../types/api';
import { AxiosError } from 'axios';

// Ensure functions are exported
export const getCurrentUser = async (): Promise<UserRead> => {
  try {
    const response = await apiClient.get<UserRead>('/users/me');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<HTTPValidationError>;
    console.error('Failed to fetch current user:', axiosError.response?.data);
    throw axiosError;
  }
};

export const updateCurrentUser = async (userData: UserUpdate): Promise<UserRead> => {
  try {
    const response = await apiClient.put<UserRead>('/users/me', userData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<HTTPValidationError>;
    console.error('Failed to update user profile:', axiosError.response?.data);
    throw axiosError;
  }
};

export const updateCurrentUserPassword = async (passwordData: UserPasswordUpdate): Promise<void> => {
  try {
    await apiClient.patch('/users/me/password', passwordData);
  } catch (error) {
    const axiosError = error as AxiosError<HTTPValidationError>;
    console.error('Failed to update user password:', axiosError.response?.data);
    throw axiosError;
  }
};
