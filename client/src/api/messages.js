import axiosInstance from "./axios";

export const getMessages = async (receiverId) => {
  try {
    const response = await axiosInstance.get(`/messages/${receiverId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const sendMessage = async (receiverId, message) => {
  try {
    const response = await axiosInstance.post(`/messages/send/${receiverId}`, {
      message,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
