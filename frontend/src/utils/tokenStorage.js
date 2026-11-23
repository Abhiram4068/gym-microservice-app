const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setRefreshToken = (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token);

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
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

// Decodes JWT payload or parses stored role
export const getUserRole = () => {
  const token = getToken();
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        const roleClaim = payload.role 
          || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
          || payload.Role 
          || payload.roleId;

        if (roleClaim !== undefined && roleClaim !== null) {
          if (roleClaim === 'SuperAdmin' || roleClaim === 'Admin' || roleClaim === 1 || roleClaim === '1') return 1;
          if (roleClaim === 'Manager' || roleClaim === 2 || roleClaim === '2') return 2;
          if (roleClaim === 'Employee' || roleClaim === 3 || roleClaim === '3') return 3;
          const num = Number(roleClaim);
          if (!isNaN(num)) return num;
        }
      }
    } catch {
      // Fall through to stored userData
    }
  }

  const user = getUserData();
  if (user) {
    const r = user.role ?? user.roleId;
    if (r === 'SuperAdmin' || r === 'Admin' || r === 1 || r === '1') return 1;
    if (r === 'Manager' || r === 2 || r === '2') return 2;
    if (r === 'Employee' || r === 3 || r === '3') return 3;
    const num = Number(r);
    if (!isNaN(num)) return num;
  }

  return null;
};
