import React from 'react';
import { downloadCSV } from '../utils/csvParser';
import { GOOGLE_ADS_COLUMNS, MODES } from '../utils/constants';

const DownloadButton = ({ data, mode, disabled, filename }) => {
  const handleDownload = () => {
    const columns = GOOGLE_ADS_COLUMNS[mode];
    const outputFilename = mode === MODES.FACEBOOK
      ? (filename ? filename.replace('.csv', '-meta.csv') : 'meta-conversions.csv')
      : (filename ? filename.replace('.csv', '-google-ads.csv') : 'google-ads-conversions.csv');

    downloadCSV(data, columns, outputFilename);
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleDownload}
        disabled={disabled || !data || data.length === 0}
        className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
          disabled || !data || data.length === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {mode === MODES.FACEBOOK ? 'Download Meta CSV' : 'Download Google Ads CSV'}
      </button>
      
      {disabled && (
        <span className="text-sm text-red-600">
          Fix errors before downloading
        </span>
      )}
      
      {!disabled && data && data.length > 0 && (
        <span className="text-sm text-gray-500">
          {data.length} rows ready for export
        </span>
      )}
    </div>
  );
};

export default DownloadButton;
