/**
 * Generates uppercase initials from first/last name or a full name string.
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} fullName
 * @returns {string}
 */
export const getInitials = (firstName = '', lastName = '', fullName = '') => {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';

  if (first || last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }

  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return '';
};
