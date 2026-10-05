# Google sign-in setup

The login and registration pages use Google Identity Services. The frontend sends Google's ID token to the API, and the API verifies the token with Google's client library before creating a Bookverse session.

## Create a web client ID

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Select or create a Google Cloud project and configure its OAuth consent/branding screen.
3. Create an OAuth 2.0 client with application type **Web application**.
4. Add `http://localhost:5173` under **Authorized JavaScript origins**. No redirect URI is needed for this sign-in flow.
5. Copy the web client ID. Do not put a client secret in the frontend.

Google's setup guide: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid

## Add the client ID to the local environment

Use the same client ID in both places:

- Add `VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com` to `frontend/app/.env.local`.
- Add `GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com` to `backend/.env`.

Keep the other variables already in `backend/.env`. The frontend client ID is public; the MongoDB URI, Razorpay secret, and JWT secret are private and must not be shared or committed.

Restart both Vite and the backend after saving the environment files. Then open `/login` or `/register` and select **Continue with Google**. If the OAuth consent screen is in testing mode, add the Google account you are using as a test user in the Cloud Console.

On the first Google sign-in, a verified Google email matching an existing Bookverse account links to that account, preserving its orders, wishlist, and role. A new verified email creates a standard user account. Google-created accounts have no local password; their login is through Google.
