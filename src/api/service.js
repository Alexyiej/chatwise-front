import axios from 'axios';

const apiUrl = 'localhost:5000';

const apiClient = axios.create({
    baseURL: `http://${apiUrl}/`, 
    withCredentials: true 
});


apiClient.interceptors.response.use(
    response => {
        if (response.config.headers['X-Retry-Attempt'] === 'true') {
            console.log("retry")
        }
        return response;
    },
    
    async error => {
        const originalRequest = error.config;
        console.log(originalRequest)
        
        if (error.response.status === 401 && !error.response.config.headers['X-Retry-Attempt']) {
            try {
                await apiClient.get('/auth/jwt', {
                    headers: { 'X-Retry-Attempt': 'true' }
                });
                return apiClient(originalRequest);
                
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export { apiClient, apiUrl }