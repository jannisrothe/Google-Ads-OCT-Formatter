/**
 * SHA-256 hash a string using Web Crypto API
 * @param {string} text - Text to hash
 * @returns {Promise<string>} - Hex-encoded hash
 */
export const sha256Hash = async (text) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Normalize an email address for hashing
 * - Lowercase
 * - Trim whitespace
 * - Remove dots from gmail local part
 * - Remove plus aliases from gmail
 * @param {string} email - Email to normalize
 * @returns {string} - Normalized email
 */
export const normalizeEmail = (email) => {
  if (!email) return '';
  
  let normalized = email.toLowerCase().trim();
  
  // Check if it's a Gmail address
  const atIndex = normalized.indexOf('@');
  if (atIndex === -1) return normalized;
  
  const localPart = normalized.substring(0, atIndex);
  const domain = normalized.substring(atIndex + 1);
  
  // Gmail-specific normalization
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    // Remove dots from local part
    let cleanLocal = localPart.replace(/\./g, '');
    // Remove everything after + (plus alias)
    const plusIndex = cleanLocal.indexOf('+');
    if (plusIndex !== -1) {
      cleanLocal = cleanLocal.substring(0, plusIndex);
    }
    return `${cleanLocal}@${domain}`;
  }
  
  // For non-Gmail, just remove plus alias
  let cleanLocal = localPart;
  const plusIndex = cleanLocal.indexOf('+');
  if (plusIndex !== -1) {
    cleanLocal = cleanLocal.substring(0, plusIndex);
  }
  
  return `${cleanLocal}@${domain}`;
};

/**
 * Normalize a phone number to E.164 format
 * @param {string} phone - Phone number to normalize
 * @param {string} defaultCountryCode - Default country code if not present (e.g., '1' for US)
 * @returns {string} - Normalized phone in E.164 format
 */
export const normalizePhone = (phone, defaultCountryCode = '1') => {
  if (!phone) return '';
  
  // Remove all non-digit characters except leading +
  let normalized = phone.trim();
  const hasPlus = normalized.startsWith('+');
  normalized = normalized.replace(/\D/g, '');
  
  // If already has country code (started with +), use as is
  if (hasPlus && normalized.length >= 10) {
    return `+${normalized}`;
  }
  
  // If it's a 10-digit number (likely US/Canada), add country code
  if (normalized.length === 10) {
    return `+${defaultCountryCode}${normalized}`;
  }
  
  // If it's 11 digits starting with 1 (US with country code), format it
  if (normalized.length === 11 && normalized.startsWith('1')) {
    return `+${normalized}`;
  }
  
  // For other formats, just prefix with + if not present
  return hasPlus ? `+${normalized}` : `+${defaultCountryCode}${normalized}`;
};

/**
 * Normalize a name for hashing
 * - Lowercase
 * - Trim whitespace
 * - Remove punctuation
 * @param {string} name - Name to normalize
 * @returns {string} - Normalized name
 */
export const normalizeName = (name) => {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
};

/**
 * Hash a field value for EC4L
 * @param {string} value - Value to hash
 * @param {string} fieldType - Type of field ('email', 'phone', 'firstName', 'lastName')
 * @returns {Promise<string>} - Hashed value or empty string
 */
export const hashField = async (value, fieldType) => {
  if (!value || value.trim() === '') return '';
  
  let normalized;
  switch (fieldType) {
    case 'email':
      normalized = normalizeEmail(value);
      break;
    case 'phone':
      normalized = normalizePhone(value);
      break;
    case 'firstName':
    case 'lastName':
      normalized = normalizeName(value);
      break;
    default:
      normalized = value.trim();
  }
  
  if (!normalized) return '';
  return sha256Hash(normalized);
};

/**
 * Check if a value looks like it's already hashed (64 hex characters)
 * @param {string} value - Value to check
 * @returns {boolean}
 */
export const isAlreadyHashed = (value) => {
  if (!value) return false;
  return /^[a-f0-9]{64}$/i.test(value.trim());
};
