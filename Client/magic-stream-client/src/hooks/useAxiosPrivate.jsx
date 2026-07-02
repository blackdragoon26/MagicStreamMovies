import { useEffect, useMemo } from 'react';
import axios from 'axios';

import useAuth from './useAuth';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const useAxiosPrivate = () =>{

    const axiosAuth = useMemo(() => axios.create({
        baseURL: apiUrl,
        withCredentials: true, // important for HTTP-only cookies
    }), []);


    const {auth,setAuth} = useAuth();

    let isRefreshing = false;
    let failedQueue = [];

    // Helper to process queued requests after token refresh
    const processQueue = (error, response = null) => {
        failedQueue.forEach(prom => {
            if (error) {
            prom.reject(error);
            } else {
            prom.resolve(response);
            }
        });

        failedQueue = [];
    };

    useEffect(() => {
        // Request interceptor: Inject Bearer Access Token
        const requestIntercept = axiosAuth.interceptors.request.use(
            config => {
                if (!config.headers['Authorization'] && auth?.token) {
                    config.headers['Authorization'] = `Bearer ${auth.token}`;
                }
                return config;
            },
            error => Promise.reject(error)
        );

        // Response interceptor: Handle 401 Unauthorized errors and refresh tokens
        const responseIntercept = axiosAuth.interceptors.response.use(
            response => response,
            async error => {
                console.log('⚠ Interceptor caught error:', error);
                const originalRequest = error.config;

                if (originalRequest.url.includes('/refresh') && error.response?.status === 401) {
                    console.error('❌ Refresh token has expired or is invalid.');
                    return Promise.reject(error);
                }

                if (error.response && error.response.status === 401 && !originalRequest._retry) {
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        })
                        .then(() => axiosAuth(originalRequest))
                        .catch(err => Promise.reject(err));
                    }

                    originalRequest._retry = true;
                    isRefreshing = true;

                    return new Promise((resolve, reject) => {
                        axiosAuth
                            .post('/refresh')
                            .then((res) => {
                                const newToken = res.data?.token;
                                const newRefreshToken = res.data?.refresh_token;
                                
                                if (newToken) {
                                    const updatedAuth = { ...auth, token: newToken };
                                    if (newRefreshToken) {
                                        updatedAuth.refresh_token = newRefreshToken;
                                    }
                                    setAuth(updatedAuth);
                                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                                }
                                
                                processQueue(null);

                                axiosAuth(originalRequest)
                                    .then(resolve)
                                    .catch(reject);
                            })
                            .catch(refreshError => {
                                processQueue(refreshError, null);
                                localStorage.removeItem('user');
                                setAuth(null);
                                reject(refreshError);
                            })
                            .finally(() => {
                                isRefreshing = false;
                            });
                    });
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axiosAuth.interceptors.request.eject(requestIntercept);
            axiosAuth.interceptors.response.eject(responseIntercept);
        };

    }, [auth]);

    return axiosAuth;
}

export default useAxiosPrivate;