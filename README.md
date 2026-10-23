# JARVIS Watch AI

A mobile-friendly JARVIS-inspired smartwatch companion **web prototype** with a cyan / electric-purple / neon-pink interface, live browser clock, browser speech input (where supported), and an optional secure AI backend.

## What works now
- Responsive watch-face-style UI.
- Live time and date from the browser device.
- Browser speech recognition where supported and permission is granted.
- Demo responses when no backend is configured.
- Optional Node.js backend that calls the OpenAI Responses API without exposing the secret key in browser code.
- Basic request-size validation and rate limiting.

## Important limitations
This repository is **not smartwatch firmware**. It does not currently pair with the Pebble Orbit / RDFit, read real heart rate, steps or watch battery, send notifications, or install software on the physical watch. Those features require a documented/supported device API, companion-app integration, and hardware testing. The values on the watch face are placeholders.

## Publish the frontend with GitHub Pages
1. Open **Settings → Pages** in this repository.
2. Select **Deploy from a branch**.
3. Select branch `main` and folder `/(root)`, then Save.
4. After GitHub finishes publishing, open https://santhoshbk-gd.github.io/jarvis-watch-ai/

The static frontend works in demo mode without an API key.

## Enable real AI replies (optional)
The backend must be deployed separately; GitHub Pages cannot run Node.js server code.

1. Create an OpenAI API key in your API account. API usage may cost money and is separate from a ChatGPT subscription.
2. Deploy this repository as a Node.js web service on a host that supports Node.js (for example Render).
3. Set the service's start command to `npm start` and use Node.js 20 or newer.
4. Add environment variables in the host dashboard:
   - `OPENAI_API_KEY` = your private API key
   - `OPENAI_MODEL` = `gpt-5-mini` (change if that model is unavailable to your API account)
   - `CORS_ORIGIN` = `https://santhoshbk-gd.github.io`
5. Deploy and test `https://YOUR-BACKEND-DOMAIN/api/health`. It should return JSON with `ok: true` and `aiConfigured: true`.
6. Open the GitHub Pages site, enter the deployed backend base URL in **Backend URL**, and tap **Save**. Ask a question to test real AI.

### Security
- Never paste your API key into `index.html`, a public GitHub file, or the frontend Backend URL field.
- Keep the key only in the hosting provider's private environment variables.
- Set `CORS_ORIGIN` to the exact published frontend origin.
- The included rate limit is a starter safeguard, not a complete production abuse-prevention system. Monitor API usage and billing.

## Run locally
Requires Node.js 20+.
1. Clone or download this repository.
2. Run `npm install`.
3. Set `OPENAI_API_KEY` in your local environment.
4. Set `CORS_ORIGIN=http://localhost:5500` if your frontend is served on that origin.
5. Run `npm start`.
6. Serve `index.html` from a local static server and enter `http://localhost:3000` as the backend base URL only if the frontend is hosted on an origin allowed by CORS.

## Next step for real watch integration
Identify the exact watch model, supported BLE services / SDK / companion-app API, and permissions first. Do not flash unofficial firmware or attempt undocumented writes to the watch.
