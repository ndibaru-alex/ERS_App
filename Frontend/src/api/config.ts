import axios from 'axios';

// Get API URL from environment variables, fall back to localhost if not set
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';

// Define public endpoints that don't need auth
const PUBLIC_ENDPOINTS = [
    '/mps',               // POST new MP and GET all MPs
    /^\/mps\/applicant\//, // GET MPs by applicant
    '/applicants/mobile/request',  // Mobile search OTP request
    '/applicants/mobile/verify',   // Mobile search OTP verification
    '/applicants/mobile/update',   // Mobile update endpoint
    /^\/applicants\/mobile\/.*/,   // Any mobile-related endpoint
    '/applicants',  // Allow application submission
    '/apply/edit', // Ensure /apply/edit is treated as a public route
    /^\/apply\/edit\/.*/ // Treat all /apply/edit/:id routes as public
];

export const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Check if the endpoint is public
        const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => {
            if (typeof endpoint === 'string') {
                return config.url === endpoint;
            }
            return endpoint.test(config.url || '');
        });

        // Only add auth token if it's not a public endpoint
        if (!isPublicEndpoint) {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only remove token and redirect if it's not a public endpoint
            const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => {
                if (typeof endpoint === 'string') {
                    return error.config?.url === endpoint;
                }
                return endpoint.test(error.config?.url || '');
            });

            if (!isPublicEndpoint) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);