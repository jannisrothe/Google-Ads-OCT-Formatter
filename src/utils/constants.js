// Upload modes
export const MODES = {
  STANDARD: 'standard',
  EC4L: 'ec4l'
};

// Common timezones with UTC offsets
export const TIMEZONES = [
  { value: '+00:00', label: 'UTC (GMT+0)' },
  { value: '+00:00', label: 'Europe/London (GMT+0)' },
  { value: '+01:00', label: 'Europe/Paris (GMT+1)' },
  { value: '+01:00', label: 'Europe/Berlin (GMT+1)' },
  { value: '+01:00', label: 'Europe/Amsterdam (GMT+1)' },
  { value: '+02:00', label: 'Europe/Athens (GMT+2)' },
  { value: '+02:00', label: 'Africa/Cairo (GMT+2)' },
  { value: '+03:00', label: 'Europe/Moscow (GMT+3)' },
  { value: '+03:30', label: 'Asia/Tehran (GMT+3:30)' },
  { value: '+04:00', label: 'Asia/Dubai (GMT+4)' },
  { value: '+05:00', label: 'Asia/Karachi (GMT+5)' },
  { value: '+05:30', label: 'Asia/Kolkata (GMT+5:30)' },
  { value: '+06:00', label: 'Asia/Dhaka (GMT+6)' },
  { value: '+07:00', label: 'Asia/Bangkok (GMT+7)' },
  { value: '+08:00', label: 'Asia/Singapore (GMT+8)' },
  { value: '+08:00', label: 'Asia/Hong_Kong (GMT+8)' },
  { value: '+09:00', label: 'Asia/Tokyo (GMT+9)' },
  { value: '+09:00', label: 'Asia/Seoul (GMT+9)' },
  { value: '+10:00', label: 'Australia/Sydney (GMT+10)' },
  { value: '+12:00', label: 'Pacific/Auckland (GMT+12)' },
  { value: '-05:00', label: 'US/Eastern (GMT-5)' },
  { value: '-06:00', label: 'US/Central (GMT-6)' },
  { value: '-07:00', label: 'US/Mountain (GMT-7)' },
  { value: '-08:00', label: 'US/Pacific (GMT-8)' },
  { value: '-03:00', label: 'America/Sao_Paulo (GMT-3)' },
  { value: '-04:00', label: 'America/New_York (GMT-4 DST)' },
];

// ISO 4217 currency codes (common ones)
export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD',
  'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR', 'RUB', 'ZAR', 'TRY', 'BRL',
  'TWD', 'DKK', 'PLN', 'THB', 'IDR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP',
  'AED', 'COP', 'SAR', 'MYR', 'RON', 'ARS', 'VND', 'EGP', 'PKR', 'NGN'
];

// Column name aliases for fuzzy matching
export const COLUMN_ALIASES = {
  gclid: ['gclid', 'google_click_id', 'click_id', 'googleclickid', 'google click id'],
  email: ['email', 'e-mail', 'email_address', 'emailaddress', 'user_email', 'customer_email'],
  phone: ['phone', 'tel', 'telephone', 'phone_number', 'phonenumber', 'mobile', 'mobile_phone', 'cell'],
  firstName: ['first_name', 'firstname', 'first', 'fname', 'given_name', 'givenname'],
  lastName: ['last_name', 'lastname', 'last', 'lname', 'surname', 'family_name', 'familyname'],
  conversionTime: ['date', 'timestamp', 'conversion_date', 'created_at', 'conversion_time', 'time', 'datetime', 'converted_at', 'conversion_datetime'],
  conversionValue: ['value', 'revenue', 'amount', 'total', 'conversion_value', 'order_value', 'price', 'sale_amount'],
  currency: ['currency', 'curr', 'currency_code', 'currencycode', 'cur'],
  country: ['country', 'country_code', 'countrycode', 'nation'],
  zip: ['zip', 'zipcode', 'zip_code', 'postal_code', 'postalcode', 'postcode', 'postal']
};

// Google Ads output column names
export const GOOGLE_ADS_COLUMNS = {
  standard: [
    'Google Click ID',
    'Conversion Name',
    'Conversion Time',
    'Conversion Value',
    'Conversion Currency'
  ],
  ec4l: [
    'Email',
    'Phone Number',
    'First Name',
    'Last Name',
    'Country',
    'Zip',
    'Conversion Name',
    'Conversion Time',
    'Conversion Value',
    'Conversion Currency'
  ]
};

// Validation messages
export const VALIDATION_MESSAGES = {
  errors: {
    missingGclid: 'Missing Google Click ID (GCLID) - required for Standard mode',
    missingEmailOrPhone: 'Missing both Email and Phone - at least one is required for EC4L mode',
    invalidDate: 'Invalid date format - could not parse',
    emptyRow: 'Empty row with no data'
  },
  warnings: {
    gclidTooOld: 'GCLID may be older than 90 days - conversion might not be attributed',
    ec4lTooOld: 'Conversion may be older than 63 days - may not be matched',
    possibleDuplicate: 'Possible duplicate entry detected',
    missingValue: 'Missing conversion value',
    missingCurrency: 'Missing currency - default will be applied'
  },
  info: {
    dateReformatted: 'Date reformatted to Google Ads format',
    timezoneApplied: 'Default timezone applied',
    timeAdded: 'Default time (12:00:00) added',
    emailHashed: 'Email normalized and hashed (SHA-256)',
    phoneHashed: 'Phone normalized and hashed (SHA-256)',
    nameHashed: 'Name normalized and hashed (SHA-256)',
    currencyFixed: 'Currency code uppercased',
    valueFixed: 'Value format corrected'
  }
};

// Date format patterns for detection
export const DATE_PATTERNS = [
  { regex: /^\d{4}-\d{2}-\d{2}$/, format: 'yyyy-MM-dd' },
  { regex: /^\d{4}\/\d{2}\/\d{2}$/, format: 'yyyy/MM/dd' },
  { regex: /^\d{2}\/\d{2}\/\d{4}$/, format: 'MM/dd/yyyy' },
  { regex: /^\d{2}-\d{2}-\d{4}$/, format: 'dd-MM-yyyy' },
  { regex: /^\d{2}\.\d{2}\.\d{4}$/, format: 'dd.MM.yyyy' },
  { regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, format: 'ISO' },
  { regex: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, format: 'yyyy-MM-dd HH:mm:ss' }
];

// Conversion windows (in days)
export const CONVERSION_WINDOWS = {
  standard: 90, // GCLID-based conversions
  ec4l: 63      // Enhanced Conversions for Leads
};
