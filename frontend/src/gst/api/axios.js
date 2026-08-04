import axios from 'axios';

let apiUrl = (import.meta.env.VITE_GST_API_URL || '/api/gst').replace(/\/+$/, '');
if (!apiUrl.endsWith('/')) apiUrl += '/';

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to fix leading slashes and include the auth token
api.interceptors.request.use(
    (config) => {
        // Strip leading slash from config.url so Axios doesn't drop the /api from baseURL
        if (config.url && config.url.startsWith('/')) {
            config.url = config.url.substring(1);
        }
        const token = localStorage.getItem('gst_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
