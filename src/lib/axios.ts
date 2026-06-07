import axios from "axios";
const api = axios.create({
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});
api.interceptors.request.use(
    async (config) => {
        const token = `Bearer ${atob(localStorage.getItem("access_token") ?? "")}`;

        config.headers.Authorization = `${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

export { api };