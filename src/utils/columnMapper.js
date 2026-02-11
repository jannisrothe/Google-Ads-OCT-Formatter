import { COLUMN_ALIASES } from './constants';

/**
 * Normalize a column name for comparison
 * @param {string} name - Column name to normalize
 * @returns {string} - Normalized name (lowercase, no special chars)
 */
const normalizeColumnName = (name) => {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
};

/**
 * Check if a header matches any of the aliases for a field
 * @param {string} header - The CSV header to check
 * @param {Array} aliases - Array of possible aliases
 * @returns {boolean}
 */
const matchesAliases = (header, aliases) => {
  const normalizedHeader = normalizeColumnName(header);
  return aliases.some(alias => {
    const normalizedAlias = normalizeColumnName(alias);
    return normalizedHeader === normalizedAlias || 
           normalizedHeader.includes(normalizedAlias) ||
           normalizedAlias.includes(normalizedHeader);
  });
};

/**
 * Auto-detect column mappings from CSV headers
 * @param {Array} headers - Array of CSV header names
 * @param {string} mode - 'standard' or 'ec4l'
 * @returns {Object} - Mapping of field names to CSV column names
 */
export const autoDetectColumns = (headers, mode) => {
  const mappings = {};
  
  // Fields to detect based on mode
  const fieldsToDetect = mode === 'standard' 
    ? ['gclid', 'conversionTime', 'conversionValue', 'currency']
    : ['email', 'phone', 'firstName', 'lastName', 'country', 'zip', 'conversionTime', 'conversionValue', 'currency'];

  fieldsToDetect.forEach(field => {
    const aliases = COLUMN_ALIASES[field];
    if (!aliases) return;

    const matchedHeader = headers.find(header => matchesAliases(header, aliases));
    if (matchedHeader) {
      mappings[field] = matchedHeader;
    }
  });

  return mappings;
};

/**
 * Get available fields for a mode
 * @param {string} mode - 'standard' or 'ec4l'
 * @returns {Array} - Array of field definitions with name, label, and required status
 */
export const getFieldsForMode = (mode) => {
  if (mode === 'standard') {
    return [
      { name: 'gclid', label: 'Google Click ID (GCLID)', required: true },
      { name: 'conversionTime', label: 'Conversion Time', required: true },
      { name: 'conversionValue', label: 'Conversion Value', required: false },
      { name: 'currency', label: 'Conversion Currency', required: false }
    ];
  }
  
  return [
    { name: 'email', label: 'Email', required: false, note: 'At least Email or Phone required' },
    { name: 'phone', label: 'Phone', required: false, note: 'At least Email or Phone required' },
    { name: 'firstName', label: 'First Name', required: false },
    { name: 'lastName', label: 'Last Name', required: false },
    { name: 'country', label: 'Country', required: false },
    { name: 'zip', label: 'Zip/Postal Code', required: false },
    { name: 'conversionTime', label: 'Conversion Time', required: true },
    { name: 'conversionValue', label: 'Conversion Value', required: false },
    { name: 'currency', label: 'Conversion Currency', required: false }
  ];
};

/**
 * Apply column mappings to transform source data
 * @param {Array} data - Source CSV data
 * @param {Object} mappings - Column mappings (field -> source column)
 * @param {string} mode - 'standard' or 'ec4l'
 * @returns {Array} - Transformed data with standardized field names
 */
export const applyMappings = (data, mappings, mode) => {
  return data.map((row, index) => {
    const transformed = { _rowIndex: index + 1 };
    
    Object.entries(mappings).forEach(([field, sourceColumn]) => {
      if (sourceColumn && row[sourceColumn] !== undefined) {
        transformed[field] = row[sourceColumn];
      }
    });
    
    return transformed;
  });
};
