TRIVENKEM FRAGRANCE FINDER - with AI help + internet search

WHAT IS NEW
- "Ask AI" tab: customer doubts answered from your catalogue + internet search.
- "Ask AI" button on every fragrance and on "no match" results.
- privacy.html (Privacy Policy) linked at the bottom of the app.
- Missing files added (style.css, manifest.json, icon-512.png).
- Without AI setup the app still works fully; Ask AI shows catalogue search only.

A. PUT THE APP ON GITHUB
1. Upload ALL files in this folder to a repository (index.html in the main folder). Commit.
2. Settings > Pages > Deploy from branch > main > / (root) > Save.
3. Open https://YOURNAME.github.io/REPO/ on your phone > Add to Home screen.
4. Open privacy.html and replace [your email here] with your email.

B. TURN ON AI (needed once, about 10 minutes, free Cloudflare account)
Why: GitHub Pages cannot hide an API key. The small "worker" keeps your key secret.
1. Get an API key at console.anthropic.com. In Billing set a low monthly spend limit.
2. Cloudflare dashboard > Workers & Pages > Create > Worker > Deploy > Edit code.
   Delete the sample, paste everything from worker/worker.js, Deploy.
3. Worker > Settings > Variables and Secrets:
   - ANTHROPIC_API_KEY  (type: Secret)  = your key
   - ALLOWED_ORIGINS    (type: Text)    = https://YOURNAME.github.io   (no /REPO, no slash at end)
   - MODEL (optional)                   = claude-haiku-5-5  (cheap; use claude-sonnet-5-5 for better answers)
4. Copy the worker URL (https://something.workers.dev). On GitHub open config.js, paste it
   between the quotes: window.AI_CONFIG={endpoint:'https://something.workers.dev'};  Commit.
5. Reopen the app (close and open twice so the offline copy refreshes). Try Ask AI.
Cloudflare: also add a Rate Limiting rule (Security > WAF) e.g. 20 requests per minute per IP,
so strangers cannot run up your bill.

PRIVACY (summary)
- No login, no ads, no analytics. Catalogue edits and My notes stay in the phone browser.
- Only the question typed in Ask AI, recent chat messages and a catalogue extract are sent.
  My notes (price, stock, feedback) are never sent.
- Tell staff: do not type customer phone numbers or personal details into Ask AI.
- privacy.html is a general template, not legal advice. Review it for your business.

USING IT
- Works offline after the first open (Ask AI falls back to catalogue search offline).
- Take Import / Export > Backup (JSON) after every update.
- Many fragrances: Import / Export > Blank template (CSV), fill in Excel, Import.
- To change the starting 42 fragrances for everyone: edit data.js on GitHub.
