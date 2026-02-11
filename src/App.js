import React, { useState, useCallback, useEffect } from 'react';
import './App.css';

import { MODES } from './utils/constants';
import { applyMappings } from './utils/columnMapper';
import { validateAll } from './utils/validator';
import { optimizeAll, transformToGoogleAdsFormat } from './utils/optimizer';

import ModeSelector from './components/ModeSelector';
import SettingsPanel from './components/SettingsPanel';
import FileUpload from './components/FileUpload';
import ColumnMapper from './components/ColumnMapper';
import ValidationResults from './components/ValidationResults';
import DataPreview from './components/DataPreview';
import DownloadButton from './components/DownloadButton';

function App() {
  // Mode selection
  const [mode, setMode] = useState(MODES.STANDARD);
  
  // Settings
  const [settings, setSettings] = useState({
    conversionName: '',
    timezone: '+00:00',
    defaultCurrency: ''
  });
  
  // File data
  const [fileData, setFileData] = useState(null);
  const [filename, setFilename] = useState('');
  
  // Column mappings
  const [mappings, setMappings] = useState({});
  
  // Processed data
  const [mappedData, setMappedData] = useState([]);
  const [validation, setValidation] = useState(null);
  const [optimizedData, setOptimizedData] = useState([]);
  const [optimizationSummary, setOptimizationSummary] = useState(null);
  const [exportData, setExportData] = useState([]);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file upload
  const handleFileLoaded = useCallback((result) => {
    setFileData(result);
    setFilename(result.filename);
    setMappings({});
    setMappedData([]);
    setValidation(null);
    setOptimizedData([]);
    setOptimizationSummary(null);
    setExportData([]);
  }, []);

  // Process data when mappings change
  useEffect(() => {
    if (!fileData || Object.keys(mappings).length === 0) {
      return;
    }

    const processData = async () => {
      setIsProcessing(true);
      
      try {
        // Apply column mappings
        let mapped = applyMappings(fileData.data, mappings, mode);
        
        // Auto-remove rows with 0 or no conversion value
        const originalCount = mapped.length;
        mapped = mapped.filter(row => {
          const value = row.conversionValue;
          if (value === null || value === undefined || value === '') return false;
          const numValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
          return !isNaN(numValue) && numValue > 0;
        });
        
        if (mapped.length < originalCount) {
          console.log(`Auto-removed ${originalCount - mapped.length} rows with zero or no conversion value`);
        }
        
        setMappedData(mapped);
        
        // Validate
        const validationResult = validateAll(mapped, mode, settings);
        setValidation(validationResult);
        
        // Optimize (even if there are errors, to show what would be fixed)
        const optimizationResult = await optimizeAll(mapped, mode, settings);
        setOptimizedData(optimizationResult.data);
        setOptimizationSummary(optimizationResult.changeSummary);
        
        // Transform to Google Ads format for export
        if (validationResult.canExport && settings.conversionName) {
          const exportReady = transformToGoogleAdsFormat(
            optimizationResult.data, 
            mode, 
            settings.conversionName
          );
          setExportData(exportReady);
        } else {
          setExportData([]);
        }
      } catch (error) {
        console.error('Error processing data:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    processData();
  }, [fileData, mappings, mode, settings]);

  // Reset when mode changes
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setMappings({});
    setValidation(null);
    setOptimizedData([]);
    setExportData([]);
  };

  // Check if settings are valid
  const settingsValid = settings.conversionName && settings.conversionName.trim() !== '';

  // Get unique row indices with errors
  const errorRowIndices = validation 
    ? [...new Set(validation.issues.filter(i => i.type === 'error').map(i => i.rowIndex))]
    : [];

  // Handler to remove rows with errors
  const handleRemoveErrorRows = useCallback(() => {
    if (!fileData || errorRowIndices.length === 0) return;
    
    // Filter out rows with errors (using 1-indexed rowIndex)
    const filteredData = fileData.data.filter((_, index) => !errorRowIndices.includes(index + 1));
    
    setFileData({
      ...fileData,
      data: filteredData
    });
  }, [fileData, errorRowIndices]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Google Ads Offline Conversion Helper
          </h1>
          <p className="text-gray-500 mt-1">
            Convert your CSV data to Google Ads-compatible format
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Step 1: Mode Selection */}
        <ModeSelector mode={mode} onChange={handleModeChange} />

        {/* Step 2: Settings */}
        <SettingsPanel settings={settings} onChange={setSettings} />

        {/* Settings Warning */}
        {!settingsValid && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              Please enter a Conversion Name above before uploading your file.
            </p>
          </div>
        )}

        {/* Step 3: File Upload */}
        <FileUpload 
          onFileLoaded={handleFileLoaded} 
          disabled={!settingsValid}
        />

        {/* File Info */}
        {fileData && (
          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">{filename}</span>
                <span className="text-gray-500 ml-2">({fileData.data.length} rows)</span>
              </div>
              <button
                onClick={() => {
                  setFileData(null);
                  setFilename('');
                  setMappings({});
                  setValidation(null);
                  setOptimizedData([]);
                  setExportData([]);
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove file
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Column Mapping */}
        {fileData && (
          <ColumnMapper
            headers={fileData.headers}
            mode={mode}
            mappings={mappings}
            onChange={setMappings}
          />
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mb-6 text-center py-8">
            <svg className="animate-spin h-8 w-8 mx-auto text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500 mt-2">Processing data...</p>
          </div>
        )}

        {/* Step 5: Validation Results */}
        {validation && !isProcessing && (
          <ValidationResults 
            validation={validation} 
            optimizationSummary={optimizationSummary}
            onRemoveErrorRows={handleRemoveErrorRows}
            errorRowCount={errorRowIndices.length}
          />
        )}

        {/* Step 6: Data Preview */}
        {mappedData.length > 0 && !isProcessing && (
          <DataPreview
            data={optimizedData.length > 0 ? optimizedData : mappedData}
            mode={mode}
            validation={validation}
          />
        )}

        {/* Step 7: Download */}
        {validation && !isProcessing && (
          <DownloadButton
            data={exportData}
            mode={mode}
            disabled={!validation.canExport || !settingsValid}
            filename={filename}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-sm text-gray-500 text-center">
            All processing happens in your browser. No data is sent to any server.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
