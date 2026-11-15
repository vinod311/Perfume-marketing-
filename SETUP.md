# Trivenkem AI Assistant — GitHub Pages version (no Supabase AI backend)

This package adds a Gemini-powered assistant to the existing static Trivenkem app. It preserves the existing local fragrance search, 42-item seed catalogue, word dictionary, filters, favourites, detail pages, edit forms, import/export and existing optional data-sync code. The AI feature itself does **not** use Supabase, an Edge Function, or another backend.

## Files

- `app.js` — updated frontend. Replace the current repository's `app.js` with this file.
- `data.js` — unchanged original seed data; keep your existing copy or use this copy as a backup.

## Add it to GitHub

1. Open your existing GitHub repository.
2. Open `app.js`, choose Edit (pencil), replace its contents with the included updated `app.js`, and commit the change. Or upload the replacement file using **Add file → Upload files**.
3. Do not upload your Gemini API key. No key is included in this package.
4. Wait for GitHub Pages to publish the commit, then open/reload your app.

## Connect Gemini in the app

1. Create a Gemini API key in Google AI Studio: https://aistudio.google.com/apikey
2. Open your Trivenkem app and tap **Ask Trivenkem AI**.
3. Paste your key in the password field and tap **Connect**.
4. Choose **AI + Google Search** for grounded answers with source links, or **AI answer only**.
5. Ask in English or Tamil. Examples:
   - What is substantivity in detergent fragrance?
   - Explain solubility in Tamil.
   - What should I check when testing fragrance in floor cleaner?

The key is held only in page memory and is cleared when the page is refreshed or closed. It is not written into `app.js`, `data.js`, GitHub, or localStorage.

## Important security limitation of GitHub Pages

GitHub Pages is static hosting. It cannot keep a shared API key secret or run a private server-side proxy by itself. When a browser calls Gemini directly, the key is visible to the person using that browser and can be inspected in browser developer tools/network traffic. This version is suitable only if **you personally enter and use your own key** and understand that exposure risk. Do not publish a shared key in the repository or give this public app to other users with your key embedded.

Google's documentation explicitly advises against exposing API keys in client-side production apps and recommends a backend proxy for shared/public use: https://ai.google.dev/gemini-api/docs/api-key

If you later want multiple customers/staff to use the assistant without seeing your key, you will need a server-side service (for example Cloud Run or another backend). That is separate from GitHub Pages and may have its own free-tier limits.

## Free-tier and reliability notes

The code uses `gemini-2.5-flash` and Google's `google_search` grounding tool. Free availability, model access, quotas and rate limits depend on Google's current account/project terms and can change. Check: https://ai.google.dev/gemini-api/docs/pricing and https://ai.google.dev/gemini-api/docs/google-search.

The assistant receives the current local fragrance catalogue as context. It must not be treated as an official Givaudan technical document. Verify dosage, IFRA status, certificates, safety, stability and product suitability against the relevant official documents and actual product testing.

## Troubleshooting

- **API key invalid / 400 or 403:** create a fresh key in AI Studio and ensure Gemini API access is enabled for its project.
- **429 / quota:** the free-tier rate limit has been reached; wait for it to reset or check the current quota page. Do not enable billing unless you choose to.
- **No source links:** Gemini Search grounding returns source links only when the model actually uses search and returns grounding metadata.
- **Changes not visible:** confirm GitHub Pages deployed the latest commit and hard-refresh the browser.


## Complete GitHub Pages file set
Upload all files in this folder to the repository root (`main` branch, `/ (root)`). The required entry page is `index.html`. Keep `app.js` and `data.js` beside it. This package contains no Supabase function and does not require Supabase.

The AI feature calls Gemini directly from the browser after you enter your own API key. This is intended for personal use; a browser-based public website cannot keep an API key secret. Never hard-code your key in these files or commit it to GitHub.
