TRIVENKEM FRAGRANCE FINDER - Supabase version

ONE-TIME SETUP IN SUPABASE
1. SQL Editor: the fragrances table is already created. Open a New query, paste supabase-setup.sql, Run (adds the words table).
2. Authentication > Users > Add user: create your email + password (tick Auto Confirm).
3. Authentication > sign-in settings: turn OFF "Allow new users to sign up".
4. Your Project URL and publishable key are already in config.js.

PUT ON GITHUB
1. Unzip. Create a new GitHub repository (Public).
2. Upload ALL unzipped files (index.html must be in the main folder). Commit.
3. Settings > Pages > Deploy from branch > main > / (root) > Save.
4. Open https://YOURNAME.github.io/REPO/ on your phone, sign in, then Add to Home screen.

USING IT
- First login uploads the 42 catalogue fragrances to Supabase automatically.
- Every add / edit / star / delete is saved to Supabase and shows on all your phones after reopening.
- Offline: shows the last saved copy; changes sync when internet returns.
- Still take a Backup (JSON) from Import / Export once in a while.
- To add many fragrances: Import / Export > Blank template (CSV), fill in Excel, Import.
