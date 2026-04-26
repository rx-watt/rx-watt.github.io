# RX Watt Site

This site now runs as a small Express app so the contact form can submit to a live backend endpoint.

## Run locally

1. Create a `.env` file from `.env.example`.
2. Add working SMTP credentials.
3. Install dependencies:

```powershell
npm install
```

4. Start the app:

```powershell
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

## Required mail settings

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`
- `CONTACT_TO`

Without those values, the form UI works but the backend will reject submissions because it has nowhere to send the email.
