import api from "./axios";

export const registerUser = (data) => {
  return api.post("/users/register", data);
};

export const loginUser = (data) => {
  return api.post("/users/login", data);
};

export const logoutUser = () => {
  return api.post("/users/logout");
};

export const refreshToken = () => {
  return api.post("/users/refresh");
};

export const getProfile = () => {
  return api.get("/users/profile");
};
