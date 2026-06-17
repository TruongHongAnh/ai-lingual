import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://localhost:7123/api', // Nhớ kiểm tra lại cổng C# của bạn nhé
    headers: {
        'Content-Type': 'application/json'
    }
});

// Chuyển config về dạng 'any' để bypass lỗi phiên bản của Axios
apiClient.interceptors.request.use(
    (config: any) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: any) => Promise.reject(error)
);

export default apiClient;