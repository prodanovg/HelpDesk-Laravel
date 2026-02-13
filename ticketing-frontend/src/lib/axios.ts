import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000", // Laravel API
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true, // needed for Sanctum (important!)
    withXSRFToken: true,
});

export default api;
