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
 * Check if a value looks like an Excel serial date number
 * Excel dates are typically 5-digit numbers representing days since 1900-01-01
 * We use a narrower range to avoid false positives with monetary values
 * @param {any} value - The value to check
 * @returns {boolean}
 */
const isExcelDateNumber = (value) => {
  if (typeof value !== 'number') return false;
  // Excel date range for reasonable dates (2020-2030): ~43831 to ~47848
  // Using a wider range but still excluding common monetary values
  // Dates before 2000 (~36526) or after 2050 (~54789) are unlikely
  return value >= 36526 && value <= 54789 && Number.isInteger(value);
};

/**
 * Check if a column header looks like a date/time column
 * @param {string} header - The column header
 * @returns {boolean}
 */
const isDateColumn = (header) => {
  if (!header) return false;
  const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  const dateKeywords = ['date', 'time', 'timestamp', 'created', 'converted', 'datetime', 'conversion'];
  return dateKeywords.some(keyword => normalized.includes(keyword));
};

/**
 * Convert Excel serial date to JavaScript Date string
 * @param {number} serial - Excel serial date number
 * @returns {string} - Date string in yyyy-mm-dd format
 */
const excelDateToString = (serial) => {
  // Excel's epoch is December 30, 1899 (accounting for the leap year bug)
  const excelEpoch = new Date(1899, 11, 30);
  const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Check if a value looks like a valid header (not empty, not a placeholder)
 * @param {any} value - The value to check
 * @returns {boolean}
 */
const isValidHeader = (value) => {
  if (value === null || value === undefined) return false;
  const str = String(value).trim();
  // Filter out empty values and xlsx placeholder names
  if (!str || str.startsWith('__EMPTY')) return false;
  return true;
};

/**
 * Find the most likely header row in raw Excel data
 * @param {Array<Array>} rawData - Raw data as array of arrays
 * @returns {number} - Index of the header row (0-based)
 */
const findHeaderRow = (rawData) => {
  if (!rawData || rawData.length === 0) return 0;
  
  // Look through the first 10 rows to find the best header candidate
  const maxRowsToCheck = Math.min(10, rawData.length);
  let bestRowIndex = 0;
  let bestScore = 0;
  
  for (let i = 0; i < maxRowsToCheck; i++) {
    const row = rawData[i];
    if (!row) continue;
    
    // Score based on: number of non-empty cells, all cells are strings, no numbers
    let score = 0;
    let nonEmptyCells = 0;
    let hasOnlyStrings = true;
    
    for (const cell of row) {
      if (cell !== null && cell !== undefined && String(cell).trim() !== '') {
        nonEmptyCells++;
        // Headers are usually strings, not numbers
        if (typeof cell === 'number') {
          hasOnlyStrings = false;
        }
      }
    }
    
    // Calculate score: more non-empty cells is better, strings-only is a bonus
    score = nonEmptyCells * (hasOnlyStrings ? 2 : 1);
    
    // Prefer rows that have multiple cells filled
    if (nonEmptyCells >= 2 && score > bestScore) {
      bestScore = score;
      bestRowIndex = i;
    }
  }
  
  return bestRowIndex;
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
        
        // First, get raw data as array of arrays to find the header row
        const rawData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, // Use array of arrays
          defval: ''
        });
        
        // Find the header row
        const headerRowIndex = findHeaderRow(rawData);
        
        // Convert to JSON using the detected header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          defval: '',
          range: headerRowIndex // Start from the header row
        });
        
        // Get and clean headers - filter out empty/placeholder columns
        let headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
        
        // Filter out __EMPTY columns and clean up header names
        const validHeaders = headers.filter(h => isValidHeader(h));
        
        // Clean the data to only include valid columns and convert Excel dates
        const cleanedData = jsonData.map(row => {
          const cleanRow = {};
          validHeaders.forEach(header => {
            let value = row[header];
            // Only convert Excel serial dates for columns that look like date columns
            // This prevents monetary values like 1919, 2070, etc. from being converted
            if (isDateColumn(header) && isExcelDateNumber(value)) {
              value = excelDateToString(value);
            }
            cleanRow[header] = value;
          });
          return cleanRow;
        });
        
        // Also get ALL headers (including empty) for fallback display
        // but mark which ones are valid
        const allHeaders = headers.map(h => String(h).trim()).filter(h => h && !h.startsWith('__EMPTY'));
        
        resolve({
          data: cleanedData,
          headers: allHeaders.length > 0 ? allHeaders : validHeaders,
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
