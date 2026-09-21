# VIKAS 2026 Payment Dashboard

Production-ready frontend for reviewing and verifying VIKAS 2026 payment records. The dashboard contains no demo participant or payment data: all records and payment settings are loaded from a backend REST API.

## Run locally

No build step or frontend dependencies are required.

```bash
npm test
npx serve .
```

You can also open `index.html` directly, but serving the folder is recommended when connecting an API.

## Connect the backend

Open `index.html` and edit the single `window.VIKAS_BACKEND_CONFIG` block near the bottom of the file:

```js
window.VIKAS_BACKEND_CONFIG = {
  baseUrl: "https://your-backend.example.com/api",
  databaseProvider: "PostgreSQL",
  authMode: "bearer", // or "cookie"
  tokenStorageKey: "vikas_admin_token",
  pollIntervalMs: 30000,
  endpoints: {
    health: "/health",
    payments: "/payments",
    paymentConfig: "/payment-config"
  }
};
```

Database credentials, administrator secrets and payment-provider secrets must remain on the backend. Never put them in this repository or in browser JavaScript.

The complete request and response specification is in [BACKEND_API.md](BACKEND_API.md).

## Authentication

- `authMode: "bearer"`: store the administrator access token in `sessionStorage` under `tokenStorageKey` before loading the dashboard.
- `authMode: "cookie"`: use a secure, HTTP-only, same-site cookie from the backend. The frontend sends requests with credentials.

The backend must authenticate and authorize every create, configuration and verification request. Frontend controls are not a security boundary.

## Deploy

This is a static site. Deploy the repository root on GitHub Pages, Netlify, Vercel or any static host; `index.html` is the entry point.

For GitHub Pages:

1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select the `main` branch and `/ (root)` folder.
4. Save, then allow the deployed origin in the backend CORS configuration.

The dashboard intentionally shows **Backend setup required** until a real API URL is configured. That is a safe state, not an application error.

## Pre-deployment check

```bash
npm test
```

The repository also runs the same validation automatically on pushes and pull requests.

