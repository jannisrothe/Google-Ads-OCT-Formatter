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
    eventName: '',
    dataProcessingOptions: 'non-ldu',
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
        
        // Transform to export format
        const nameValid = mode === MODES.FACEBOOK
          ? !!(settings.eventName && settings.eventName.trim())
          : !!(settings.conversionName && settings.conversionName.trim());
        if (validationResult.canExport && nameValid) {
          const exportReady = transformToGoogleAdsFormat(
            optimizationResult.data,
            mode,
            mode === MODES.FACEBOOK ? settings.eventName : settings.conversionName,
            settings
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
  const settingsValid = mode === MODES.FACEBOOK
    ? !!(settings.eventName && settings.eventName.trim())
    : !!(settings.conversionName && settings.conversionName.trim());

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
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <header className="bg-white border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <h1 className="text-2xl font-black tracking-tight text-black">
            Offline Conversion Formatter
          </h1>
          <p className="text-gray-600 mt-1 font-medium">
            Convert your CSV data to Google Ads or Meta-compatible format
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Step 1: Mode Selection */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl font-black text-black leading-none">01</span>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Select Mode</span>
        </div>
        <ModeSelector mode={mode} onChange={handleModeChange} />

        {/* Step 2: Settings */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl font-black text-black leading-none">02</span>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Settings</span>
        </div>
        <SettingsPanel settings={settings} onChange={setSettings} mode={mode} />

        {/* Settings Warning */}
        {!settingsValid && (
          <div className="mb-6 bg-yellow-50 border-2 border-black shadow-brutal-sm p-4">
            <p className="text-black text-sm font-medium">
              Please enter {mode === MODES.FACEBOOK ? 'an Event Name' : 'a Conversion Name'} above before uploading your file.
            </p>
          </div>
        )}

        {/* Step 3: File Upload */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl font-black text-black leading-none">03</span>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Upload File</span>
        </div>
        <FileUpload
          onFileLoaded={handleFileLoaded}
          disabled={!settingsValid}
        />

        {/* File Info */}
        {fileData && (
          <div className="mb-6 bg-white border-2 border-black shadow-brutal p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-black">{filename}</span>
                <span className="text-gray-500 ml-2 font-medium">({fileData.data.length} rows)</span>
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
                className="text-sm font-bold text-red-600 hover:text-red-800 underline"
              >
                Remove file
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Column Mapping */}
        {fileData && (
          <>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl font-black text-black leading-none">04</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Map Columns</span>
            </div>
            <ColumnMapper
              headers={fileData.headers}
              mode={mode}
              mappings={mappings}
              onChange={setMappings}
            />
          </>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mb-6 text-center py-8">
            <svg className="animate-spin h-8 w-8 mx-auto text-main" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600 mt-2 font-medium">Processing data...</p>
          </div>
        )}

        {/* Step 5: Validation Results */}
        {validation && !isProcessing && (
          <>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl font-black text-black leading-none">05</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Validation</span>
            </div>
            <ValidationResults
              validation={validation}
              optimizationSummary={optimizationSummary}
              onRemoveErrorRows={handleRemoveErrorRows}
              errorRowCount={errorRowIndices.length}
            />
          </>
        )}

        {/* Step 6: Data Preview */}
        {mappedData.length > 0 && !isProcessing && (
          <>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl font-black text-black leading-none">06</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Preview</span>
            </div>
            <DataPreview
              data={optimizedData.length > 0 ? optimizedData : mappedData}
              mode={mode}
              validation={validation}
            />
          </>
        )}

        {/* Step 7: Download */}
        {validation && !isProcessing && (
          <>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl font-black text-black leading-none">07</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Export</span>
            </div>
            <DownloadButton
              data={exportData}
              mode={mode}
              disabled={!validation.canExport || !settingsValid}
              filename={filename}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-black mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-sm text-gray-500 text-center font-medium">
            All processing happens in your browser. No data is sent to any server.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
