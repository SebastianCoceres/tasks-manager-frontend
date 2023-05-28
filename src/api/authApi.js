import axiosClient from "./axiosClient";

const authApi = {
  signup: (params) => axiosClient.post("auth/signup", params),
  login: (params) => axiosClient.post("auth/login", params),
  verifyToken: () => axiosClient.post("auth/verify-token"),
  editUserName: (params) => axiosClient.put("auth/edit-username", params),
  editPassword: (params) => axiosClient.put("auth/edit-password", params),
};

export default authApi;
