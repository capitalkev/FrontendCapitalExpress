// API configuration
export const API_BASE_URL = import.meta.env.PROD 
  ? 'http://127.0.0.1:8000/api'
  : '/api';

export const API_SUBMIT_URL = import.meta.env.PROD
  ? 'http://127.0.0.1:8000'
  : '';