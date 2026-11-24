export const UserStatus = {
  Active: 1,
  Inactive: 2,
  Pending: 3,
  Rejected: 4,
  Deleted: 5
};

export const UserRole = {
  SuperAdmin: 1,
  GymOwner: 2,
  Receptionist: 3,
  Trainer: 4
};

/**
 * Gym Entity Interface representation
 * @typedef {Object} Gym
 * @property {string} id - Primary Key (e.g., UUID)
 * @property {string} name - Gym name
 * @property {string} email - Gym contact email
 * @property {string} phoneNumber - Gym contact phone
 * @property {string} addressLine1 - Address
 * @property {string} [addressLine2] - Area / Landmark (optional)
 * @property {string} city - City
 * @property {string} state - State
 * @property {string} country - Country
 * @property {string} pinCode - PIN Code
 * @property {string} [websiteUrl] - Website URL (optional)
 * @property {string} [logoUrl] - Logo URL (optional)
 * @property {string} [rejectionReason] - Rejection reason if rejected
 * @property {string} createdAt - Registration date ISO string
 * @property {string} [updatedAt] - Last update date ISO string
 */

/**
 * User Entity Interface representation
 * @typedef {Object} User
 * @property {string} id - Primary Key (e.g., UUID)
 * @property {string|null} gymId - Foreign Key to Gym (NULL for SuperAdmin)
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} email - Login & personal email
 * @property {string} [phoneNumber] - Owner / User phone number
 * @property {number} role - UserRole (1=SuperAdmin, 2=GymOwner, 3=Receptionist, 4=Trainer)
 * @property {number} status - UserStatus (1=Active, 2=Inactive, 3=Pending, 4=Rejected, 5=Deleted)
 * @property {string} createdAt - Creation timestamp
 * @property {string} [updatedAt] - Update timestamp
 */
