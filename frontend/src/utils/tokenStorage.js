/**
 * Session & Token Storage
 */

export const AUTH_STORAGE_MODE = 'localstorage'; // Switch to 'cookie' when backend sets httpOnly cookies

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const UserRole = {
  SuperAdmin: 1,
  GymOwner: 2,
  Receptionist: 3,
  Trainer: 4
};

export const getToken = () => {
  if (AUTH_STORAGE_MODE === 'cookie') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setToken = (token) => {
  if (AUTH_STORAGE_MODE === 'localstorage' && token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
};

export const getRefreshToken = () => {
  if (AUTH_STORAGE_MODE === 'cookie') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token) => {
  if (AUTH_STORAGE_MODE === 'localstorage' && token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};

export const getUserData = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setUserData = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const saveSession = ({ accessToken, refreshToken, user }) => {
  if (accessToken) setToken(accessToken);
  if (refreshToken) setRefreshToken(refreshToken);
  if (user) setUserData(user);
};

export const clearSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const removeToken = clearSession;

export const getUserRole = () => {
  const user = getUserData();
  return user ? user.role : null;
};

export const isAuthenticated = () => {
  if (AUTH_STORAGE_MODE === 'cookie') {
    return getUserData() !== null;
  }
  return Boolean(getToken());
};
