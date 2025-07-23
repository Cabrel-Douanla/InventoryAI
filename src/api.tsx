// src/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // si tu utilises des cookies (optionnel)
});

export default api;

// Dans api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // ou selon ta logique
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
