import axios from "axios";
import queryString from "query-string";

// const baseUrl = 'http://[::1]:5000/api/v1/';
const baseUrl = !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? 'http://[::1]:5000/api/v1/': 'http://srv-captain--tasks-manager-backend/api/v1/';
const getToken = () => localStorage.getItem("token");

const axiosClient = axios.create({
  baseURL: baseUrl,
  paramsSerializer: (params) => queryString.stringify({ params }),
});

axiosClient.interceptors.request.use(async (config) => {
  return {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${getToken()}`
    },
  };
});

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data;
    return response;
  },
  (err) => {
    if (!err.response) {
      return alert(err);
    }
    throw err.response;
  }
);

export default axiosClient;
