import api from "./axios";

export const getMessages = async (userId) => {
  const response = await api.get(`/messages/${userId}`);
  return response.data;
};

export const sendMessage = async (userId, message, attachment, fileName) => {
  const response = await api.post(`/messages/send/${userId}`, { message, attachment, fileName });
  return response.data;
};

export const deleteMessage = async (messageId) => {
  const response = await api.delete(`/messages/${messageId}`);
  return response.data;
};
