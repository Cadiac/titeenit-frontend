import axios from 'axios';

export const apiclient = axios.create({ baseURL: `${import.meta.env.VITE_BACKEND_API_URL}/` });
