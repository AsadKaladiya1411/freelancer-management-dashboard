import axios from "axios";

const resolveApiBaseURL = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  if (process.env.NODE_ENV === "production") {
    return "https://freelancer-management-dashboard.onrender.com/api";
  }

  return "http://localhost:5000/api";
};

const defaultBaseURL = resolveApiBaseURL();

export const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
};

const api = axios.create({
  baseURL: defaultBaseURL,
  timeout: 20000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = {
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while calling the API.",
      details: error.response?.data || null
    };

    if (error.response?.status === 401) {
      clearAuthStorage();

      if (window.location.pathname !== "/" && window.location.pathname !== "/register") {
        window.location.replace("/");
      }
    }

    return Promise.reject(normalizedError);
  }
);

export default api;