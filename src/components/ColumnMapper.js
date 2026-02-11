import React, { useEffect } from 'react';
import { autoDetectColumns, getFieldsForMode } from '../utils/columnMapper';

const ColumnMapper = ({ headers, mode, mappings, onChange }) => {
  const fields = getFieldsForMode(mode);

  // Auto-detect columns when headers or mode change
  useEffect(() => {
    if (headers && headers.length > 0) {
      const detected = autoDetectColumns(headers, mode);
      onChange(detected);
    }
  }, [headers, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMappingChange = (fieldName, sourceColumn) => {
    onChange({
      ...mappings,
      [fieldName]: sourceColumn || undefined
    });
  };

  if (!headers || headers.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="font-medium text-gray-900 mb-3">Column Mapping</h3>
      <p className="text-sm text-gray-500 mb-4">
        We've auto-detected your columns. Adjust if needed.
      </p>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Google Ads Field
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Your CSV Column
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fields.map((field) => {
              const isMapped = !!mappings[field.name];
              const isRequired = field.required;
              
              return (
                <tr key={field.name} className={!isMapped && isRequired ? 'bg-red-50' : ''}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {field.label}
                      {isRequired && <span className="text-red-500 ml-1">*</span>}
                    </div>
                    {field.note && (
                      <div className="text-xs text-gray-500">{field.note}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={mappings[field.name] || ''}
                      onChange={(e) => handleMappingChange(field.name, e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                        !isMapped && isRequired ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">-- Select column --</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {isMapped ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Mapped
                      </span>
                    ) : isRequired ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Optional
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ColumnMapper;
