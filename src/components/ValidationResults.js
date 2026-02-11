import React from 'react';

const ValidationResults = ({ validation, optimizationSummary }) => {
  if (!validation) return null;

  const { summary, issues } = validation;

  // Group issues by type
  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');
  
  // Convert optimization summary to info items
  const infoItems = optimizationSummary 
    ? Object.entries(optimizationSummary).map(([message, count]) => ({
        message,
        count
      }))
    : [];

  return (
    <div className="mb-6 space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
          <div className="text-sm text-gray-500">Total Rows</div>
        </div>
        
        <div className={`rounded-lg p-4 ${summary.errors > 0 ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-200'}`}>
          <div className={`text-2xl font-bold ${summary.errors > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {summary.errors}
          </div>
          <div className={`text-sm ${summary.errors > 0 ? 'text-red-500' : 'text-gray-500'}`}>Errors</div>
        </div>
        
        <div className={`rounded-lg p-4 ${summary.warnings > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-white border border-gray-200'}`}>
          <div className={`text-2xl font-bold ${summary.warnings > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>
            {summary.warnings}
          </div>
          <div className={`text-sm ${summary.warnings > 0 ? 'text-yellow-500' : 'text-gray-500'}`}>Warnings</div>
        </div>
        
        <div className={`rounded-lg p-4 ${infoItems.length > 0 ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-gray-200'}`}>
          <div className={`text-2xl font-bold ${infoItems.length > 0 ? 'text-blue-600' : 'text-gray-900'}`}>
            {infoItems.length}
          </div>
          <div className={`text-sm ${infoItems.length > 0 ? 'text-blue-500' : 'text-gray-500'}`}>Auto-fixes</div>
        </div>
      </div>

      {/* Errors List */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Errors (must fix before export)
          </h4>
          <ul className="space-y-1 text-sm text-red-700">
            {errors.slice(0, 10).map((error, idx) => (
              <li key={idx}>
                Row {error.rowIndex}: {error.message}
              </li>
            ))}
            {errors.length > 10 && (
              <li className="font-medium">...and {errors.length - 10} more errors</li>
            )}
          </ul>
        </div>
      )}

      {/* Warnings List */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Warnings (export allowed)
          </h4>
          <ul className="space-y-1 text-sm text-yellow-700">
            {warnings.slice(0, 10).map((warning, idx) => (
              <li key={idx}>
                Row {warning.rowIndex}: {warning.message}
              </li>
            ))}
            {warnings.length > 10 && (
              <li className="font-medium">...and {warnings.length - 10} more warnings</li>
            )}
          </ul>
        </div>
      )}

      {/* Info / Auto-fixes List */}
      {infoItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Auto-fixes Applied
          </h4>
          <ul className="space-y-1 text-sm text-blue-700">
            {infoItems.map((item, idx) => (
              <li key={idx}>
                {item.message} ({item.count} rows)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success message */}
      {summary.errors === 0 && summary.warnings === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            All rows validated successfully!
          </h4>
        </div>
      )}
    </div>
  );
};

export default ValidationResults;
