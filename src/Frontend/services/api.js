import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Injeta o token automaticamente em todos os pedidos
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Se o token expirar, faz logout automático
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;