import axiosClient from "./axiosClient";

const taskApi = {
  create: (boardId, params) =>
    axiosClient.post(`boards/${boardId}/tasks`, params),
  updatePosition: (boardId, params) =>
    axiosClient.put(`boards/${boardId}/tasks/update-position`, params),
  delete: (boardId, taskId) =>
    axiosClient.delete(`boards/${boardId}/tasks/${taskId}`),
  update: (boardId, taskId, params) =>
    axiosClient.put(`boards/${boardId}/tasks/${taskId}`, params),
  getTasksInCalendar: () => axiosClient.get(`tasks/inCalendar`),
  getTasksBetweenDates: (params) => axiosClient.post(`tasks/betweenDates`, params),
  generatePDF: (params) => axiosClient.post(`tasks/generate-pdf`, params, { responseType: "arraybuffer" }),
};

export default taskApi;
