import axios from "axios";

export const getCsrf = () => axios.get("http://localhost:8000/sanctum/csrf-cookie", { withCredentials: true });

const api = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true, // important!
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

export default api;
