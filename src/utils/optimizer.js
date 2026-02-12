import { format, parseISO, isValid, isToday } from 'date-fns';
import { MODES, VALIDATION_MESSAGES, GOOGLE_ADS_COLUMNS } from './constants';
import { hashField, isAlreadyHashed } from './hasher';
import { tryParseDate } from './validator';

/**
 * Optimization result for a single row
 * @typedef {Object} OptimizationResult
 * @property {Object} data - Optimized row data
 * @property {Array} changes - List of changes made (info messages)
 */

/**
 * Optimize a date string to Google Ads format
 * @param {string} dateStr - Original date string
 * @param {string} defaultTimezone - Default timezone offset (e.g., '+00:00')
 * @returns {Object} - { value: string, changes: Array }
 */
export const optimizeDate = (dateStr, defaultTimezone = '+00:00') => {
  const changes = [];
  
  if (!dateStr || dateStr.trim() === '') {
    return { value: '', changes: [] };
  }

  const trimmed = dateStr.trim();
  
  // Check if already in correct format (with T separator)
  const correctFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;
  if (correctFormat.test(trimmed)) {
    return { value: trimmed, changes: [] };
  }

  // Try to parse the date
  const parsed = tryParseDate(trimmed);
  if (!parsed || !isValid(parsed)) {
    return { value: dateStr, changes: [] };
  }

  // Check if original has time component
  const hasTime = /\d{2}:\d{2}/.test(trimmed);
  
  // Check if original has timezone
  const hasTimezone = /[+-]\d{2}:\d{2}$/.test(trimmed) || /Z$/.test(trimmed);

  // Extract time if present, otherwise default to 23:59:59
  // Using end of day ensures the conversion is after any ad click that day
  // (conversions must happen AFTER the ad click for proper attribution)
  let hours = 23, minutes = 59, seconds = 59;
  
  if (hasTime) {
    const timeMatch = trimmed.match(/(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (timeMatch) {
      hours = parseInt(timeMatch[1]);
      minutes = parseInt(timeMatch[2]);
      seconds = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
    }
  } else {
    // For today's date, cap at current time (can't be in the future)
    if (isToday(parsed)) {
      const now = new Date();
      hours = now.getHours();
      minutes = now.getMinutes();
      seconds = now.getSeconds();
    }
    changes.push(VALIDATION_MESSAGES.info.timeAdded);
  }

  // Format date part
  const datePart = format(parsed, 'yyyy-MM-dd');
  const timePart = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Determine timezone
  let timezone = defaultTimezone;
  if (hasTimezone) {
    const tzMatch = trimmed.match(/([+-]\d{2}:\d{2})$/);
    if (tzMatch) {
      timezone = tzMatch[1];
    } else if (trimmed.endsWith('Z')) {
      timezone = '+00:00';
    }
  } else {
    changes.push(VALIDATION_MESSAGES.info.timezoneApplied);
  }

  const formatted = `${datePart}T${timePart}${timezone}`;
  
  if (formatted !== trimmed) {
    changes.push(VALIDATION_MESSAGES.info.dateReformatted);
  }

  return { value: formatted, changes };
};

/**
 * Optimize a conversion value
 * @param {string|number} value - Original value (string or number)
 * @returns {Object} - { value: string, changes: Array }
 */
export const optimizeValue = (value) => {
  const changes = [];
  
  // Handle null/undefined
  if (value === null || value === undefined || value === '') {
    return { value: '', changes: [] };
  }
  
  // Convert to string if number
  let optimized = String(value).trim();
  const original = optimized;

  // Remove currency symbols
  optimized = optimized.replace(/[$€£¥₹]/g, '');
  
  // Remove thousands separators (but be careful with decimal commas)
  // Pattern: digit followed by comma/space followed by 3 digits
  optimized = optimized.replace(/(\d)[,\s](?=\d{3})/g, '$1');
  
  // Replace comma decimal separator with period (European format)
  // Only if there's a single comma and it's followed by 1-2 digits at the end
  if (/^\d+,\d{1,2}$/.test(optimized)) {
    optimized = optimized.replace(',', '.');
  }
  
  // Remove any remaining whitespace
  optimized = optimized.replace(/\s/g, '');

  if (optimized !== original) {
    changes.push(VALIDATION_MESSAGES.info.valueFixed);
  }

  return { value: optimized, changes };
};

/**
 * Optimize a currency code
 * @param {string} currency - Original currency string
 * @param {string} defaultCurrency - Default currency if empty
 * @returns {Object} - { value: string, changes: Array }
 */
export const optimizeCurrency = (currency, defaultCurrency = '') => {
  const changes = [];
  
  if (!currency || currency.trim() === '') {
    if (defaultCurrency) {
      return { value: defaultCurrency.toUpperCase(), changes: [] };
    }
    return { value: '', changes: [] };
  }

  const original = currency.trim();
  const optimized = original.toUpperCase();

  if (optimized !== original) {
    changes.push(VALIDATION_MESSAGES.info.currencyFixed);
  }

  return { value: optimized, changes };
};

/**
 * Optimize a single row of data
 * @param {Object} row - Row data with standardized field names
 * @param {string} mode - 'standard' or 'ec4l'
 * @param {Object} settings - User settings
 * @returns {Promise<OptimizationResult>}
 */
export const optimizeRow = async (row, mode, settings) => {
  const optimized = { ...row };
  const allChanges = [];

  // Optimize date
  const dateResult = optimizeDate(row.conversionTime, settings.timezone);
  optimized.conversionTime = dateResult.value;
  allChanges.push(...dateResult.changes);

  // Optimize value (handle both string and number values from Excel)
  if (row.conversionValue !== undefined && row.conversionValue !== null && row.conversionValue !== '') {
    const valueResult = optimizeValue(row.conversionValue);
    optimized.conversionValue = valueResult.value;
    allChanges.push(...valueResult.changes);
  } else {
    optimized.conversionValue = '';
  }

  // Set currency from settings (currency is not mapped from columns)
  // Always use the default currency from settings
  optimized.currency = settings.defaultCurrency ? settings.defaultCurrency.toUpperCase() : '';

  // EC4L specific: hash PII fields
  if (mode === MODES.EC4L) {
    // Hash email
    if (row.email && !isAlreadyHashed(row.email)) {
      optimized.email = await hashField(row.email, 'email');
      allChanges.push(VALIDATION_MESSAGES.info.emailHashed);
    }

    // Hash phone
    if (row.phone && !isAlreadyHashed(row.phone)) {
      optimized.phone = await hashField(row.phone, 'phone');
      allChanges.push(VALIDATION_MESSAGES.info.phoneHashed);
    }

    // Hash names
    if (row.firstName && !isAlreadyHashed(row.firstName)) {
      optimized.firstName = await hashField(row.firstName, 'firstName');
      allChanges.push(VALIDATION_MESSAGES.info.nameHashed);
    }
    if (row.lastName && !isAlreadyHashed(row.lastName)) {
      optimized.lastName = await hashField(row.lastName, 'lastName');
      // Don't duplicate the message if firstName was also hashed
      if (!row.firstName || isAlreadyHashed(row.firstName)) {
        allChanges.push(VALIDATION_MESSAGES.info.nameHashed);
      }
    }

    // Trim country and zip (not hashed)
    if (row.country) {
      optimized.country = row.country.trim();
    }
    if (row.zip) {
      optimized.zip = row.zip.trim();
    }
  }

  return {
    data: optimized,
    changes: [...new Set(allChanges)] // Remove duplicates
  };
};

/**
 * Optimize all rows and prepare for export
 * @param {Array} data - Array of row objects
 * @param {string} mode - 'standard' or 'ec4l'
 * @param {Object} settings - User settings (conversionName, timezone, defaultCurrency)
 * @returns {Promise<Object>} - { data: Array, changes: Array, changeSummary: Object }
 */
export const optimizeAll = async (data, mode, settings) => {
  const optimizedData = [];
  const allChanges = [];
  const changeSummary = {};

  for (const row of data) {
    const result = await optimizeRow(row, mode, settings);
    optimizedData.push(result.data);
    
    result.changes.forEach(change => {
      allChanges.push({ ...change, rowIndex: row._rowIndex });
      changeSummary[change] = (changeSummary[change] || 0) + 1;
    });
  }

  return {
    data: optimizedData,
    changes: allChanges,
    changeSummary
  };
};

/**
 * Transform optimized data to Google Ads export format
 * @param {Array} data - Optimized row data
 * @param {string} mode - 'standard' or 'ec4l'
 * @param {string} conversionName - User-provided conversion name
 * @returns {Array} - Data formatted for Google Ads CSV export
 */
export const transformToGoogleAdsFormat = (data, mode, conversionName) => {
  return data.map(row => {
    if (mode === MODES.STANDARD) {
      return {
        'Google Click ID': row.gclid || '',
        'Conversion Name': conversionName,
        'Conversion Time': row.conversionTime || '',
        'Conversion Value': row.conversionValue || '',
        'Conversion Currency': row.currency || ''
      };
    }

    // EC4L format
    return {
      'Email': row.email || '',
      'Phone Number': row.phone || '',
      'First Name': row.firstName || '',
      'Last Name': row.lastName || '',
      'Country': row.country || '',
      'Zip': row.zip || '',
      'Conversion Name': conversionName,
      'Conversion Time': row.conversionTime || '',
      'Conversion Value': row.conversionValue || '',
      'Conversion Currency': row.currency || ''
    };
  });
};
