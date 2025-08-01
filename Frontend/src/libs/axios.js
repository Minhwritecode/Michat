import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === "development" ? "http://localhost:5001" : "");

export const axiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,
});

export default axiosInstance;