export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^(([^<>()[\\]\\.,;:\s@"]+(\.[^<>()[\\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(String(email).toLowerCase());
};

export const isStrongPassword = (password: string): boolean => {
  if (!password) return false;
  // At least 8 characters, one uppercase, one lowercase, one number, one special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

export const isNotEmpty = (value: string | null | undefined): boolean => {
  return value !== null && value !== undefined && value.trim() !== '';
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;
  // Basic North American phone number validation, allows for optional country code, hyphens, spaces, parentheses
  const phoneRegex = /^(\+?1[\s-]?)?(\(?[2-9][0-8][0-9]\)?[\s-]?)?([2-9][0-9]{2}[\s-]?[0-9]{4})$/;
  return phoneRegex.test(phoneNumber);
};

export const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}; 