import React from 'react';
import { TIMEZONES, CURRENCIES, MODES } from '../utils/constants';

const SettingsPanel = ({ settings, onChange, mode }) => {
  const handleChange = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-gray-900 mb-4">Conversion Settings</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Conversion Name (Google) or Event Name (Facebook) */}
        {mode === MODES.FACEBOOK ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name *
              <span className="ml-1 text-gray-400 cursor-help" title="Use lowercase. Must match exactly what's configured in your Facebook Events Manager.">
                ⓘ
              </span>
            </label>
            <input
              type="text"
              value={settings.eventName || ''}
              onChange={(e) => handleChange('eventName', e.target.value)}
              placeholder="e.g. customer, sql, opportunity"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Use lowercase. Must match your Events Manager configuration exactly.
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conversion Name *
              <span className="ml-1 text-gray-400 cursor-help" title="This must match the exact conversion action name in your Google Ads account. Go to Goals → Conversions → find the name.">
                ⓘ
              </span>
            </label>
            <input
              type="text"
              value={settings.conversionName || ''}
              onChange={(e) => handleChange('conversionName', e.target.value)}
              placeholder="e.g., Lead Form Submit"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Must match your Google Ads conversion action name exactly
            </p>
          </div>
        )}

        {/* Default Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Timezone *
          </label>
          <select
            value={settings.timezone || '+00:00'}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          >
            {TIMEZONES.map((tz, index) => (
              <option key={`${tz.value}-${index}`} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Applied when dates don't include timezone
          </p>
        </div>

        {/* Default Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Currency
          </label>
          <select
            value={settings.defaultCurrency || ''}
            onChange={(e) => handleChange('defaultCurrency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">No default</option>
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Applied when conversion value exists but currency is missing
          </p>
        </div>

        {/* Data Processing Options (Facebook only) */}
        {mode === MODES.FACEBOOK && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Processing Options *
              <span className="ml-1 text-gray-400 cursor-help" title="LDU = Limited Data Use. Select this if your users are in California (CCPA) or you need GDPR compliance.">
                ⓘ
              </span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleChange('dataProcessingOptions', 'non-ldu')}
                className={`flex-1 py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                  settings.dataProcessingOptions !== 'ldu'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                Non-LDU
              </button>
              <button
                type="button"
                onClick={() => handleChange('dataProcessingOptions', 'ldu')}
                className={`flex-1 py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                  settings.dataProcessingOptions === 'ldu'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                LDU
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              LDU = Limited Data Use (CCPA/GDPR compliance)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
