# Kamrul Yarn Trading

React 19 application built with Vite.

## Run locally

```sh
npm install
npm run dev
```

Production validation/build:

```sh
npm run lint
npm run build
```

## Business data storage

Administration, Accounts, HR & Payroll, sales, purchases, quotations, returns, and assets currently save to this browser's `localStorage`. Reports and inventory calculations read those saved records. Data is not synchronized to the Express backend, shared between users/devices, or backed up remotely. Keep a separate backup before clearing browser site data or changing browsers.

The Express service currently exposes a health endpoint only; server-side business persistence and authentication are not configured.
