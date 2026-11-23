const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export const UserRole = {
  SuperAdmin: 1,
  GymOwner: 2,
  Receptionist: 3,
  Trainer: 4
};

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

const parseRoleValue = (rawRole) => {
  if (rawRole === undefined || rawRole === null) return null;

  if (typeof rawRole === 'string') {
    const trimmed = rawRole.trim().toLowerCase();
    if (trimmed === 'superadmin' || trimmed === '1') return UserRole.SuperAdmin;
    if (trimmed === 'gymowner' || trimmed === 'owner' || trimmed === '2') return UserRole.GymOwner;
    if (trimmed === 'receptionist' || trimmed === '3') return UserRole.Receptionist;
    if (trimmed === 'trainer' || trimmed === '4') return UserRole.Trainer;
  }

  const num = Number(rawRole);
  if (num === UserRole.SuperAdmin) return UserRole.SuperAdmin;
  if (num === UserRole.GymOwner) return UserRole.GymOwner;
  if (num === UserRole.Receptionist) return UserRole.Receptionist;
  if (num === UserRole.Trainer) return UserRole.Trainer;

  return null;
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

        const resolved = parseRoleValue(roleClaim);
        if (resolved !== null) return resolved;
      }
    } catch {
      // Fall through to stored user data
    }
  }

  const user = getUserData();
  if (user) {
    const resolved = parseRoleValue(user.role ?? user.roleId);
    if (resolved !== null) return resolved;
  }

  return null;
};
