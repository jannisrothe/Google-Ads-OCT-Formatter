import Papa from 'papaparse';

/**
 * Parse a CSV file and return the data
 * @param {File} file - The CSV file to parse
 * @returns {Promise<{data: Array, headers: Array, errors: Array}>}
 */
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        resolve({
          data: results.data,
          headers: results.meta.fields || [],
          errors: results.errors
        });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * Convert data array to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} columns - Column headers in desired order
 * @returns {string} - CSV string
 */
export const toCSV = (data, columns) => {
  return Papa.unparse(data, {
    columns: columns,
    header: true
  });
};

/**
 * Download data as a CSV file
 * @param {Array} data - Array of objects to download
 * @param {Array} columns - Column headers in desired order
 * @param {string} filename - Name for the downloaded file
 */
export const downloadCSV = (data, columns, filename = 'google-ads-conversions.csv') => {
  const csv = toCSV(data, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
