# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Google Ads Offline Conversion Helper - a frontend-only React app that converts CSV data into Google Ads-compatible format. Supports two upload modes:
- **Standard**: GCLID-based offline conversions (90-day window)
- **EC4L**: Enhanced Conversions for Leads using hashed PII (63-day window)

All processing happens in-browser with no backend required.

## Commands

```bash
npm start          # Dev server at localhost:3000
npm run build      # Production build to /build
npm test           # Run tests (Jest + React Testing Library)
npm test -- --watchAll=false  # Run tests once without watch mode
```

## Architecture

### Data Flow
1. User selects mode (Standard/EC4L) and configures settings (conversion name, timezone, currency)
2. CSV uploaded → PapaParse parses → Column auto-mapping via fuzzy matching
3. Validation + auto-optimization applied → Results displayed with errors/warnings/info
4. User downloads corrected, Google Ads-ready CSV

### Core Utilities (`src/utils/`)
- `constants.js` - Timezones, ISO 4217 currencies, column aliases, validation messages
- `csvParser.js` - PapaParse wrapper for parsing and exporting CSVs
- `columnMapper.js` - Fuzzy header matching using `COLUMN_ALIASES`
- `hasher.js` - SHA-256 hashing via Web Crypto API with email/phone/name normalization
- `validator.js` - Validation rules for both modes
- `optimizer.js` - Auto-fix transformations (dates, currencies, values)

### Components (`src/components/`)
- `ModeSelector` - Toggle between Standard/EC4L
- `SettingsPanel` - Conversion name, timezone, default currency inputs
- `FileUpload` - Drag-drop CSV upload
- `ColumnMapper` - Auto/manual column mapping UI
- `ValidationResults` - Error/warning/info summary cards
- `DataPreview` - Table with cell-level issue highlighting
- `DownloadButton` - Export corrected CSV

## Key Implementation Details

### EC4L Hashing Requirements
- Email: lowercase, trim, remove gmail dots/plus aliases, then SHA-256
- Phone: normalize to E.164 format (+countrycode), then SHA-256
- Names: lowercase, trim, remove punctuation, then SHA-256
- Country/Zip: NOT hashed, just trimmed

### Date Format Target
Google Ads requires: `yyyy-mm-dd HH:mm:ss+|-HH:mm`
- Missing time defaults to `12:00:00`
- Missing timezone uses user-selected default

### Validation Levels
- **Errors** (red): Block export - missing required fields
- **Warnings** (yellow): Allow export - age warnings, duplicates
- **Info** (blue): Auto-fixes applied

## Deployment
GitHub → Hostinger Node.js Web App (auto-deploy)
Build: `npm install && npm run build`
Serve: `npx serve -s build -l 3000`
