import React from 'react';
import { MODES } from '../utils/constants';

const ModeSelector = ({ mode, onChange }) => {
  const btnBase = 'flex-1 p-4 border-2 border-black transition-all text-left font-sans';
  const btnActive = 'bg-main text-white shadow-none translate-x-1 translate-y-1';
  const btnInactive = 'bg-white text-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1';

  return (
    <div className="mb-6">
      <div className="flex gap-4">
        <button
          onClick={() => onChange(MODES.STANDARD)}
          className={`${btnBase} ${mode === MODES.STANDARD ? btnActive : btnInactive}`}
        >
          <div className="font-black mb-1 text-base">Standard (GCLID)</div>
          <div className="text-sm opacity-80 font-medium">
            For conversions with Google Click ID. 90-day attribution window.
          </div>
        </button>

        <button
          onClick={() => onChange(MODES.EC4L)}
          className={`${btnBase} ${mode === MODES.EC4L ? btnActive : btnInactive}`}
        >
          <div className="font-black mb-1 text-base">Enhanced Conversions (EC4L)</div>
          <div className="text-sm opacity-80 font-medium">
            For conversions with email/phone. Data is hashed automatically. 63-day window.
          </div>
        </button>

        <button
          onClick={() => onChange(MODES.FACEBOOK)}
          className={`${btnBase} ${mode === MODES.FACEBOOK ? btnActive : btnInactive}`}
        >
          <div className="font-black mb-1 text-base">Facebook / Meta</div>
          <div className="text-sm opacity-80 font-medium">
            For offline conversions with email/phone. Data is hashed automatically. 90-day window.
          </div>
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;
