import { MODES, CONVERSION_WINDOWS, VALIDATION_MESSAGES } from './constants';
import { differenceInDays, parseISO, isValid } from 'date-fns';

/**
 * Validation result structure
 * @typedef {Object} ValidationIssue
 * @property {string} type - 'error' | 'warning' | 'info'
 * @property {string} message - Human-readable message
 * @property {number} rowIndex - Row number (1-indexed)
 * @property {string} field - Field name that has the issue
 */

/**
 * Validate a single row of data
 * @param {Object} row - Row data with standardized field names
 * @param {string} mode - 'standard' or 'ec4l'
 * @param {Object} settings - User settings (conversionName, timezone, defaultCurrency)
 * @returns {Array<ValidationIssue>} - Array of validation issues
 */
export const validateRow = (row, mode, settings) => {
  const issues = [];
  const rowIndex = row._rowIndex || 0;

  if (mode === MODES.STANDARD) {
    // GCLID is required
    if (!row.gclid || row.gclid.trim() === '') {
      issues.push({
        type: 'error',
        message: VALIDATION_MESSAGES.errors.missingGclid,
        rowIndex,
        field: 'gclid'
      });
    }
  } else if (mode === MODES.EC4L) {
    // At least email or phone is required
    const hasEmail = row.email && row.email.trim() !== '';
    const hasPhone = row.phone && row.phone.trim() !== '';
    
    if (!hasEmail && !hasPhone) {
      issues.push({
        type: 'error',
        message: VALIDATION_MESSAGES.errors.missingEmailOrPhone,
        rowIndex,
        field: 'email'
      });
    }
  }

  // Conversion time is required for both modes
  if (!row.conversionTime || row.conversionTime.trim() === '') {
    issues.push({
      type: 'error',
      message: 'Missing conversion time - required field',
      rowIndex,
      field: 'conversionTime'
    });
  } else {
    // Check if date is parseable
    const dateIssue = validateDate(row.conversionTime, rowIndex, mode);
    if (dateIssue) {
      issues.push(dateIssue);
    }
  }

  // Check conversion value if present
  if (row.conversionValue && row.conversionValue.trim() !== '') {
    const valueIssue = validateValue(row.conversionValue, rowIndex);
    if (valueIssue) {
      issues.push(valueIssue);
    }
  } else if (row.conversionValue === undefined || row.conversionValue.trim() === '') {
    issues.push({
      type: 'warning',
      message: VALIDATION_MESSAGES.warnings.missingValue,
      rowIndex,
      field: 'conversionValue'
    });
  }

  // Check currency if value is present but currency is missing
  if (row.conversionValue && row.conversionValue.trim() !== '' && 
      (!row.currency || row.currency.trim() === '') && !settings.defaultCurrency) {
    issues.push({
      type: 'warning',
      message: VALIDATION_MESSAGES.warnings.missingCurrency,
      rowIndex,
      field: 'currency'
    });
  }

  return issues;
};

/**
 * Validate date and check conversion window
 * @param {string} dateStr - Date string to validate
 * @param {number} rowIndex - Row number for error reporting
 * @param {string} mode - 'standard' or 'ec4l'
 * @returns {ValidationIssue|null}
 */
const validateDate = (dateStr, rowIndex, mode) => {
  // Try to parse the date
  const parsed = tryParseDate(dateStr);
  
  if (!parsed) {
    return {
      type: 'error',
      message: VALIDATION_MESSAGES.errors.invalidDate,
      rowIndex,
      field: 'conversionTime'
    };
  }

  // Check conversion window
  const now = new Date();
  const daysDiff = differenceInDays(now, parsed);
  const maxDays = mode === MODES.STANDARD ? CONVERSION_WINDOWS.standard : CONVERSION_WINDOWS.ec4l;

  if (daysDiff > maxDays) {
    return {
      type: 'warning',
      message: mode === MODES.STANDARD 
        ? VALIDATION_MESSAGES.warnings.gclidTooOld 
        : VALIDATION_MESSAGES.warnings.ec4lTooOld,
      rowIndex,
      field: 'conversionTime'
    };
  }

  return null;
};

/**
 * Try to parse a date string in various formats
 * @param {string} dateStr - Date string to parse
 * @returns {Date|null}
 */
export const tryParseDate = (dateStr) => {
  if (!dateStr) return null;
  
  const trimmed = dateStr.trim();
  
  // Try ISO format first
  let parsed = parseISO(trimmed);
  if (isValid(parsed)) return parsed;
  
  // Try common formats
  const patterns = [
    // yyyy-mm-dd HH:mm:ss+TZ (target format)
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/,
    // yyyy-mm-dd
    /^(\d{4})-(\d{2})-(\d{2})$/,
    // yyyy/mm/dd
    /^(\d{4})\/(\d{2})\/(\d{2})$/,
    // mm/dd/yyyy (US format)
    /^(\d{2})\/(\d{2})\/(\d{4})$/,
    // dd-mm-yyyy (European format)
    /^(\d{2})-(\d{2})-(\d{4})$/,
    // dd.mm.yyyy
    /^(\d{2})\.(\d{2})\.(\d{4})$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      let year, month, day;
      
      if (pattern.source.startsWith('^(\\d{4})')) {
        // Year first formats
        [, year, month, day] = match;
      } else if (pattern.source.includes('\\d{2})\\/(\\d{2})\\/(\\d{4})')) {
        // mm/dd/yyyy
        [, month, day, year] = match;
      } else {
        // dd-mm-yyyy or dd.mm.yyyy
        [, day, month, year] = match;
      }
      
      parsed = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (isValid(parsed)) return parsed;
    }
  }
  
  // Last resort: try native parsing
  parsed = new Date(trimmed);
  return isValid(parsed) ? parsed : null;
};

/**
 * Validate conversion value
 * @param {string} value - Value to validate
 * @param {number} rowIndex - Row number for error reporting
 * @returns {ValidationIssue|null}
 */
const validateValue = (value, rowIndex) => {
  // Strip common currency symbols and whitespace
  const cleaned = value.replace(/[$€£¥₹,\s]/g, '').replace(',', '.');
  
  if (isNaN(parseFloat(cleaned))) {
    return {
      type: 'error',
      message: 'Invalid conversion value - must be numeric',
      rowIndex,
      field: 'conversionValue'
    };
  }
  
  return null;
};

/**
 * Validate all rows and return summary
 * @param {Array} data - Array of row objects
 * @param {string} mode - 'standard' or 'ec4l'
 * @param {Object} settings - User settings
 * @returns {Object} - { issues: Array, summary: { errors, warnings, info }, canExport: boolean }
 */
export const validateAll = (data, mode, settings) => {
  const allIssues = [];
  const seenKeys = new Set();
  
  data.forEach((row, index) => {
    const rowIssues = validateRow(row, mode, settings);
    allIssues.push(...rowIssues);
    
    // Check for duplicates
    const key = mode === MODES.STANDARD 
      ? `${row.gclid}-${row.conversionTime}`
      : `${row.email || ''}-${row.phone || ''}-${row.conversionTime}`;
    
    if (seenKeys.has(key) && key !== '-') {
      allIssues.push({
        type: 'warning',
        message: VALIDATION_MESSAGES.warnings.possibleDuplicate,
        rowIndex: index + 1,
        field: mode === MODES.STANDARD ? 'gclid' : 'email'
      });
    }
    seenKeys.add(key);
  });

  const summary = {
    errors: allIssues.filter(i => i.type === 'error').length,
    warnings: allIssues.filter(i => i.type === 'warning').length,
    info: allIssues.filter(i => i.type === 'info').length,
    total: data.length
  };

  return {
    issues: allIssues,
    summary,
    canExport: summary.errors === 0
  };
};
