import axios, { AxiosError } from "axios";
import config from "config";
import captureError from "utils/capture-error";
import { authClient } from "AuthProvider/Auth0Provider";

const instance = axios.create({
  baseURL: config.fapinstructorApi,
});

instance.interceptors.request.use(async (config) => {
  if (authClient?.isAuthenticated) {
    try {
      const token = await authClient.getAccessTokenSilently();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      captureError(error);
    }
  }

  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (!status || status !== 400) {
      captureError(error);
    }

    return Promise.reject(error);
  }
);

export default instance;
