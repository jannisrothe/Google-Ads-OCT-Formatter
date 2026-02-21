import React from 'react';
import { TIMEZONES, CURRENCIES, MODES } from '../utils/constants';

const inputClass = 'w-full px-3 py-2 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium';
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-black mb-1';

const SettingsPanel = ({ settings, onChange, mode }) => {
  const handleChange = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="bg-white border-2 border-black shadow-brutal p-5 mb-6">
      <h3 className="font-black text-black mb-4 text-base">Conversion Settings</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Conversion Name (Google) or Event Name (Facebook) */}
        {mode === MODES.FACEBOOK ? (
          <div>
            <label className={labelClass}>
              Event Name *
              <span className="ml-1 text-gray-400 cursor-help normal-case font-normal tracking-normal" title="Use lowercase. Must match exactly what's configured in your Facebook Events Manager.">
                ⓘ
              </span>
            </label>
            <input
              type="text"
              value={settings.eventName || ''}
              onChange={(e) => handleChange('eventName', e.target.value)}
              placeholder="e.g. customer, sql, opportunity"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 font-medium">
              Use lowercase. Must match your Events Manager configuration exactly.
            </p>
          </div>
        ) : (
          <div>
            <label className={labelClass}>
              Conversion Name *
              <span className="ml-1 text-gray-400 cursor-help normal-case font-normal tracking-normal" title="This must match the exact conversion action name in your Google Ads account. Go to Goals → Conversions → find the name.">
                ⓘ
              </span>
            </label>
            <input
              type="text"
              value={settings.conversionName || ''}
              onChange={(e) => handleChange('conversionName', e.target.value)}
              placeholder="e.g., Lead Form Submit"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 font-medium">
              Must match your Google Ads conversion action name exactly
            </p>
          </div>
        )}

        {/* Default Timezone */}
        <div>
          <label className={labelClass}>
            Default Timezone *
          </label>
          <select
            value={settings.timezone || '+00:00'}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className={inputClass}
          >
            {TIMEZONES.map((tz, index) => (
              <option key={`${tz.value}-${index}`} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 font-medium">
            Applied when dates don't include timezone
          </p>
        </div>

        {/* Default Currency */}
        <div>
          <label className={labelClass}>
            Default Currency
          </label>
          <select
            value={settings.defaultCurrency || ''}
            onChange={(e) => handleChange('defaultCurrency', e.target.value)}
            className={inputClass}
          >
            <option value="">No default</option>
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 font-medium">
            Applied when conversion value exists but currency is missing
          </p>
        </div>

        {/* Data Processing Options (Facebook only) */}
        {mode === MODES.FACEBOOK && (
          <div>
            <label className={labelClass}>
              Data Processing Options *
              <span className="ml-1 text-gray-400 cursor-help normal-case font-normal tracking-normal" title="LDU = Limited Data Use. Select this for users covered by privacy regulations that require limiting how their data is used for advertising (e.g. GDPR, CCPA, LGPD).">
                ⓘ
              </span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleChange('dataProcessingOptions', 'non-ldu')}
                className={`flex-1 py-2 px-3 border-2 border-black text-sm font-bold transition-all ${
                  settings.dataProcessingOptions !== 'ldu'
                    ? 'bg-main text-white shadow-none translate-x-[2px] translate-y-[2px]'
                    : 'bg-white text-black shadow-brutal-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                }`}
              >
                Non-LDU
              </button>
              <button
                type="button"
                onClick={() => handleChange('dataProcessingOptions', 'ldu')}
                className={`flex-1 py-2 px-3 border-2 border-black text-sm font-bold transition-all ${
                  settings.dataProcessingOptions === 'ldu'
                    ? 'bg-main text-white shadow-none translate-x-[2px] translate-y-[2px]'
                    : 'bg-white text-black shadow-brutal-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                }`}
              >
                LDU
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 font-medium">
              LDU = Limited Data Use — required where privacy regulations apply
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
