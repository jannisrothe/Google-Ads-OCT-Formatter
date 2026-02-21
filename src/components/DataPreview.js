import React, { useState } from 'react';

const DataPreview = ({ data, mode, validation, maxRows = 10 }) => {
  const [showAll, setShowAll] = useState(false);

  if (!data || data.length === 0) return null;

  // Get columns to display based on mode
  const columns = mode === 'standard'
    ? ['gclid', 'conversionTime', 'conversionValue', 'currency']
    : ['email', 'phone', 'firstName', 'lastName', 'country', 'zip', 'conversionTime', 'conversionValue', 'currency'];

  const columnLabels = {
    gclid: 'GCLID',
    email: 'Email',
    phone: 'Phone',
    firstName: 'First Name',
    lastName: 'Last Name',
    country: 'Country',
    zip: 'Zip',
    conversionTime: 'Conversion Time',
    conversionValue: 'Value',
    currency: 'Currency'
  };

  // Create a map of issues by row and field
  const issueMap = {};
  if (validation?.issues) {
    validation.issues.forEach(issue => {
      const key = `${issue.rowIndex}-${issue.field}`;
      if (!issueMap[key] || issue.type === 'error') {
        issueMap[key] = issue;
      }
    });
  }

  const getCellClass = (rowIndex, field) => {
    const issue = issueMap[`${rowIndex}-${field}`];
    if (!issue) return 'text-black';

    switch (issue.type) {
      case 'error':
        return 'bg-red-100 text-red-900 border border-red-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-900 border border-yellow-400';
      default:
        return 'text-black';
    }
  };

  const displayData = showAll ? data : data.slice(0, maxRows);
  const hasMore = data.length > maxRows;

  // Truncate long values for display
  const truncate = (value, maxLength = 40) => {
    if (!value) return '—';
    const str = String(value);
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm font-bold text-gray-600">{data.length} rows</span>
      </div>

      <div className="border-2 border-black shadow-brutal overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-black">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-black text-white uppercase tracking-wider">
                  #
                </th>
                {columns.map(col => (
                  <th key={col} className="px-3 py-2 text-left text-xs font-black text-white uppercase tracking-wider">
                    {columnLabels[col] || col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y-2 divide-black">
              {displayData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm font-bold text-gray-500">
                    {row._rowIndex || idx + 1}
                  </td>
                  {columns.map(col => (
                    <td
                      key={col}
                      className={`px-3 py-2 text-sm font-medium ${getCellClass(row._rowIndex || idx + 1, col)}`}
                      title={row[col] || ''}
                    >
                      {truncate(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="bg-[#f5f0e8] px-4 py-3 border-t-2 border-black">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm font-bold text-black underline hover:no-underline"
            >
              {showAll ? 'Show less' : `Show all ${data.length} rows`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPreview;
