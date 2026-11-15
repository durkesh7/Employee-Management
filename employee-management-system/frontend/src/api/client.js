import axios from "axios";

export const TOKEN_KEY = "ems_token";

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLogin = err.config?.url?.includes("/auth/login");
    if (err.response?.status === 401 && !isLogin) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/** Convert any API/network error into { message, fieldErrors } for the UI. */
export function parseError(err) {
  if (!err.response) {
    return { message: "Cannot reach the server. Check your connection and try again.", fieldErrors: {} };
  }
  const data = err.response.data || {};
  const fieldErrors = {};
  (data.errors || []).forEach((e) => {
    if (!fieldErrors[e.field]) fieldErrors[e.field] = e.message;
  });
  const message = typeof data.detail === "string" ? data.detail : "Something went wrong.";
  if (err.response.status === 409) fieldErrors.email = message;
  return { message, fieldErrors };
}

export default api;
