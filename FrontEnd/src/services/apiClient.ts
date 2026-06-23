import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:7130/api', // Nhớ kiểm tra lại cổng C# của bạn nhé
    headers: {
        'Content-Type': 'application/json'
    }
});

// Chuyển config về dạng 'any' để bypass lỗi phiên bản của Axios
apiClient.interceptors.request.use(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config: any) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error: any) => Promise.reject(error)
);

export default apiClient;