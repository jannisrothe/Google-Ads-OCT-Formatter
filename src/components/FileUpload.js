import React, { useCallback, useState } from 'react';
import { parseCSV } from '../utils/csvParser';

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  csv: 50 * 1024 * 1024,    // 50MB for CSV
  excel: 20 * 1024 * 1024,  // 20MB for Excel
};
const ROW_LIMIT = 50000;

const FileUpload = ({ onFileLoaded, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  // Supported file extensions
  const supportedExtensions = ['.csv', '.xls', '.xlsx', '.xlsm', '.xlsb'];
  const excelExtensions = ['.xls', '.xlsx', '.xlsm', '.xlsb'];

  const isValidFile = (filename) => {
    const ext = filename.toLowerCase();
    return supportedExtensions.some(e => ext.endsWith(e));
  };

  const isExcelFile = (filename) => {
    const ext = filename.toLowerCase();
    return excelExtensions.some(e => ext.endsWith(e));
  };

  const handleFile = useCallback(async (file) => {
    if (!file) return;

    if (!isValidFile(file.name)) {
      setError('Please upload a CSV or Excel file (.csv, .xls, .xlsx)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setWarning(null);

    // Check file size limits
    const isExcel = isExcelFile(file.name);
    const sizeLimit = isExcel ? FILE_SIZE_LIMITS.excel : FILE_SIZE_LIMITS.csv;
    const sizeLimitMB = sizeLimit / (1024 * 1024);

    if (file.size > sizeLimit) {
      setWarning(`Large file detected (>${sizeLimitMB}MB). Processing may be slow or fail on some devices.`);
    }

    try {
      const result = await parseCSV(file);

      if (result.data.length === 0) {
        setError('The file appears to be empty');
        return;
      }

      // Check row count
      if (result.data.length > ROW_LIMIT) {
        setWarning(`Large dataset (${result.data.length.toLocaleString()} rows). Performance may be affected. Consider splitting into smaller files.`);
      }

      onFileLoaded({
        filename: file.name,
        data: result.data,
        headers: result.headers,
        parseErrors: result.errors
      });
    } catch (err) {
      setError(`Error parsing file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [onFileLoaded]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    const file = e.target.files[0];
    handleFile(file);
  }, [handleFile]);

  const zoneClass = isDragging
    ? 'border-2 border-black bg-main cursor-pointer'
    : disabled
    ? 'border-2 border-dashed border-gray-400 bg-gray-100 cursor-not-allowed'
    : 'border-2 border-dashed border-black bg-white cursor-pointer hover:bg-blue-50';

  return (
    <div className="mb-6">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative p-10 text-center transition-colors shadow-brutal ${zoneClass}`}
      >
        <input
          type="file"
          accept=".csv,.xls,.xlsx,.xlsm,.xlsb"
          onChange={handleInputChange}
          disabled={disabled || isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {isLoading ? (
          <div className="text-gray-600">
            <svg className="animate-spin h-10 w-10 mx-auto mb-3 text-main" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-bold">Processing file...</span>
          </div>
        ) : (
          <>
            <svg
              className={`mx-auto h-12 w-12 mb-3 ${isDragging ? 'text-white' : 'text-black'}`}
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className={`mb-1 font-bold ${isDragging ? 'text-white' : 'text-black'}`}>
              {isDragging ? 'Release to upload' : (
                <><span className="underline">Click to upload</span> or drag and drop</>
              )}
            </p>
            <p className={`text-sm font-medium ${isDragging ? 'text-white' : 'text-gray-500'}`}>
              CSV or Excel files (.csv, .xls, .xlsx)
            </p>
            <p className={`text-xs mt-2 ${isDragging ? 'text-white' : 'text-gray-400'}`}>
              Recommended: up to 50,000 rows • Max ~50MB CSV / ~20MB Excel
            </p>
          </>
        )}
      </div>

      {warning && (
        <div className="mt-3 text-sm font-medium text-black bg-yellow-50 border-2 border-black shadow-brutal-sm p-3 flex items-start">
          <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {warning}
        </div>
      )}

      {error && (
        <div className="mt-3 text-sm font-bold text-red-700 bg-red-50 border-2 border-black border-l-4 border-l-red-600 p-3">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
