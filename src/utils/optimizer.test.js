import { optimizeRow } from './optimizer';
import { MODES } from './constants';

describe('optimizeRow currency handling', () => {
  test('uses the row currency when the column was mapped', async () => {
    const row = { _rowIndex: 1, gclid: 'abc', conversionTime: '2026-01-01 10:00:00+00:00', conversionValue: '10', currency: 'eur' };
    const settings = { timezone: '+00:00', defaultCurrency: 'USD' };
    const result = await optimizeRow(row, MODES.STANDARD, settings);
    expect(result.data.currency).toBe('EUR');
  });

  test('falls back to the default currency when the row has none', async () => {
    const row = { _rowIndex: 1, gclid: 'abc', conversionTime: '2026-01-01 10:00:00+00:00', conversionValue: '10' };
    const settings = { timezone: '+00:00', defaultCurrency: 'USD' };
    const result = await optimizeRow(row, MODES.STANDARD, settings);
    expect(result.data.currency).toBe('USD');
  });

  test('is empty when neither row currency nor default is set', async () => {
    const row = { _rowIndex: 1, gclid: 'abc', conversionTime: '2026-01-01 10:00:00+00:00', conversionValue: '10' };
    const settings = { timezone: '+00:00', defaultCurrency: '' };
    const result = await optimizeRow(row, MODES.STANDARD, settings);
    expect(result.data.currency).toBe('');
  });
});
