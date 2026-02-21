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
      <p className="text-sm text-gray-600 font-medium mb-4">
        We've auto-detected your columns. Adjust if needed.
      </p>

      <div className="bg-white border-2 border-black shadow-brutal overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-black">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">
                Field
              </th>
              <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">
                Your CSV Column
              </th>
              <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {fields.map((field) => {
              const isMapped = !!mappings[field.name];
              const isRequired = field.required;

              return (
                <tr key={field.name} className={!isMapped && isRequired ? 'bg-red-50' : 'bg-white'}>
                  <td className="px-4 py-3">
                    <div className="font-bold text-black">
                      {field.label}
                      {isRequired && <span className="text-red-600 ml-1">*</span>}
                    </div>
                    {field.note && (
                      <div className="text-xs text-gray-500 font-medium mt-0.5">{field.note}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={mappings[field.name] || ''}
                      onChange={(e) => handleMappingChange(field.name, e.target.value)}
                      className={`w-full px-3 py-2 border-2 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-black ${
                        !isMapped && isRequired ? 'border-red-600' : 'border-black'
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
                      <span className="inline-flex items-center px-2 py-1 border-2 border-black text-xs font-bold bg-green-400 text-black">
                        ✓ Mapped
                      </span>
                    ) : isRequired ? (
                      <span className="inline-flex items-center px-2 py-1 border-2 border-black text-xs font-bold bg-red-400 text-black">
                        Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 border-2 border-black text-xs font-bold bg-gray-200 text-black">
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
