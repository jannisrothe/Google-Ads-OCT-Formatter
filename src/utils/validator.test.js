import { validateRow } from './validator';
import { MODES } from './constants';

describe('validateRow currency handling', () => {
  test('Facebook: no error when row has a mapped currency, even without a default', () => {
    const row = { _rowIndex: 1, email: 'a@b.com', conversionTime: '2026-01-01 10:00:00+00:00', conversionValue: '10', currency: 'GBP' };
    const settings = { defaultCurrency: '' };
    const issues = validateRow(row, MODES.FACEBOOK, settings);
    expect(issues.some(i => i.field === 'currency')).toBe(false);
  });

  test('Facebook: still errors when neither row currency nor default is set', () => {
    const row = { _rowIndex: 1, email: 'a@b.com', conversionTime: '2026-01-01 10:00:00+00:00', conversionValue: '10' };
    const settings = { defaultCurrency: '' };
    const issues = validateRow(row, MODES.FACEBOOK, settings);
    expect(issues.some(i => i.field === 'currency' && i.type === 'error')).toBe(true);
  });

  test('Standard: no warning when row has a mapped currency, even without a default', () => {
    const row = { _rowIndex: 1, gclid: 'abc', conversionTime: '2026-01-01 10:00:00+00:00', conversionValue: '10', currency: 'EUR' };
    const settings = { defaultCurrency: '' };
    const issues = validateRow(row, MODES.STANDARD, settings);
    expect(issues.some(i => i.field === 'currency')).toBe(false);
  });
});
