const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getUserRole = () => {
  const user = localStorage.getItem(USER_KEY);
  if (!user) return null;
  try {
    const parsed = JSON.parse(user);
    return parsed.role ?? parsed.roleId ?? null;
  } catch {
    return null;
  }
};

export const setUserData = (userData) => {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

export const getUserData = () => {
  const user = localStorage.getItem(USER_KEY);
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};
