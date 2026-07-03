import { getFieldsForMode, autoDetectColumns } from './columnMapper';

describe('currency in column mapping', () => {
  test('getFieldsForMode includes an optional currency field for standard mode', () => {
    const fields = getFieldsForMode('standard');
    const currencyField = fields.find(f => f.name === 'currency');
    expect(currencyField).toBeDefined();
    expect(currencyField.required).toBe(false);
  });

  test('getFieldsForMode includes an optional currency field for facebook mode', () => {
    const fields = getFieldsForMode('facebook');
    const currencyField = fields.find(f => f.name === 'currency');
    expect(currencyField).toBeDefined();
  });

  test('getFieldsForMode includes an optional currency field for ec4l mode', () => {
    const fields = getFieldsForMode('ec4l');
    const currencyField = fields.find(f => f.name === 'currency');
    expect(currencyField).toBeDefined();
  });

  test('autoDetectColumns maps a "Currency" header to the currency field', () => {
    const headers = ['Email', 'Conversion Time', 'Conversion Value', 'Currency'];
    const mapped = autoDetectColumns(headers, 'ec4l');
    expect(mapped.currency).toBe('Currency');
  });
});
