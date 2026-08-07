export const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://backend-onrender-qbu7.onrender.com/api";

export const getHeaders = (contentType = "application/json") => {
  const token = localStorage.getItem("token");
  const headers = {};
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};
