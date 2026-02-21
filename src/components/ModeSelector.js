import React from 'react';
import { MODES } from '../utils/constants';

const ModeSelector = ({ mode, onChange }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Select Upload Mode
      </label>
      <div className="flex gap-4">
        <button
          onClick={() => onChange(MODES.STANDARD)}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            mode === MODES.STANDARD
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-600'
          }`}
        >
          <div className="font-semibold mb-1">Standard (GCLID)</div>
          <div className="text-sm opacity-75">
            For conversions with Google Click ID. 90-day attribution window.
          </div>
        </button>
        
        <button
          onClick={() => onChange(MODES.EC4L)}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            mode === MODES.EC4L
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-600'
          }`}
        >
          <div className="font-semibold mb-1">Enhanced Conversions (EC4L)</div>
          <div className="text-sm opacity-75">
            For conversions with email/phone. Data is hashed automatically. 63-day window.
          </div>
        </button>

        <button
          onClick={() => onChange(MODES.FACEBOOK)}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            mode === MODES.FACEBOOK
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-600'
          }`}
        >
          <div className="font-semibold mb-1">Facebook / Meta</div>
          <div className="text-sm opacity-75">
            For offline conversions with email/phone. Data is hashed automatically. 90-day window.
          </div>
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;
