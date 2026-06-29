# START HERE — get TAPP to a permanent link

Follow these 7 steps top to bottom. Check each box as you go.

---

## [ ] 1. Install Git (one time — skip if you already have it)
- Download: https://git-scm.com/download/win
- Run the installer with all the default options.
- Close and reopen any terminal afterward.
- Not sure if you have it? Open Command Prompt and type `git --version`.

## [ ] 2. Create an empty GitHub repo
- Go to https://github.com/new
- Name it `tapp`.
- Leave it **EMPTY** — do NOT add a README, .gitignore, or license.
- Click **Create repository**.
- Copy the URL it shows. It looks like:
  `https://github.com/your-username/tapp.git`

## [ ] 3. Push your code (the easy way)
- Double-click **`deploy.bat`** in this folder
  (`C:\Users\strat\Downloads\tappNew\tapp`).
- When it asks, paste the URL from step 2 and press Enter.
- If a GitHub login window pops up, approve it.
- Wait until it prints **SUCCESS**.
- (Safe to re-run if anything fails — it resets each time.)

## [ ] 4. Import the repo into Vercel
- Go to https://vercel.com and sign in **with GitHub** (free plan is fine).
- Click **Add New… → Project**.
- Find your `tapp` repo and click **Import**.
- It auto-detects Vite (build `npm run build`, output `dist`). 
- **Do not click Deploy yet** — add your keys first (step 5).

## [ ] 5. Add your two API keys
On the import screen, open **Environment Variables** and add:

| Name                         | Value                          |
| ---------------------------- | ------------------------------ |
| `VITE_CLERK_PUBLISHABLE_KEY` | your Clerk publishable key (`pk_...`) |
| `VITE_FINNHUB_KEY`           | your Finnhub API key           |

## [ ] 6. Deploy
- Click **Deploy**.
- After ~1 minute you get your permanent link:
  `https://tapp-xxxx.vercel.app`  🎉

## [ ] 7. Let Clerk know about the new domain
- Open your Clerk dashboard.
- Add the Vercel URL to the app's **allowed domains / origins**,
  so sign-in works on the live site.

---

## Updating the live site later
Change your code, then either double-click `deploy.bat` again, or run:
```cmd
git add .
git commit -m "what I changed"
git push
```
Vercel rebuilds and redeploys automatically each time.

---

## Good to know
- **Your keys are safe in git.** `.gitignore` already excludes `.env`,
  `node_modules/`, and `dist/`, so secrets are not uploaded to GitHub.
- **`VITE_` keys are visible in the browser.** That's expected and fine for the
  Clerk *publishable* key (it's public by design) and a demo Finnhub key.
  **Never** put a Clerk *secret* key in a `VITE_` variable.
- **Stuck?** Copy the exact error message and send it to me — I'll fix it.

## Files in this folder that help
- `deploy.bat`  — one-click GitHub push
- `DEPLOY.md`   — the same steps with more detail
- `START-HERE.md` — this checklist
