import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Check if a file is an Excel file
 * @param {string} filename - The filename to check
 * @returns {boolean}
 */
const isExcelFile = (filename) => {
  const ext = filename.toLowerCase().split('.').pop();
  return ['xls', 'xlsx', 'xlsm', 'xlsb'].includes(ext);
};

/**
 * Parse an Excel file and return the data
 * @param {File} file - The Excel file to parse
 * @returns {Promise<{data: Array, headers: Array, errors: Array}>}
 */
const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        // Get headers from the first row
        const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
        
        resolve({
          data: jsonData,
          headers: headers.map(h => h.trim()),
          errors: []
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse a CSV file and return the data
 * @param {File} file - The CSV file to parse
 * @returns {Promise<{data: Array, headers: Array, errors: Array}>}
 */
const parseCSVFile = (file) => {
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
 * Parse a file (CSV or Excel) and return the data
 * @param {File} file - The file to parse
 * @returns {Promise<{data: Array, headers: Array, errors: Array}>}
 */
export const parseFile = (file) => {
  if (isExcelFile(file.name)) {
    return parseExcel(file);
  }
  return parseCSVFile(file);
};

// Keep backwards compatibility
export const parseCSV = parseFile;

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
