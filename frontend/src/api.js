import axios from "axios";

const defaultBaseURL = process.env.REACT_APP_API_BASE_URL || (
  process.env.NODE_ENV === "production"
    ? "https://freelancer-management-dashboard.onrender.com/api"
    : "http://localhost:5000/api"
);

export const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
};

const api = axios.create({
  baseURL: defaultBaseURL
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
    if (error.response?.status === 401) {
      clearAuthStorage();

      if (window.location.pathname !== "/" && window.location.pathname !== "/register") {
        window.location.replace("/");
      }
    }

    return Promise.reject(error);
  }
);

export default api;