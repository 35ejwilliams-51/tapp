# Deploy TAPP to a permanent link (Vercel + GitHub)

Your app is a Vite + React project. Vercel auto-detects it, runs `npm run build`,
and serves the `dist/` folder. Once connected to GitHub, **every push auto-deploys**.

A `vercel.json` is already included (framework, build command, SPA rewrite) — you
don't need to configure those by hand.

---

## 1. Put the code on GitHub

Your project lives in the `tapp/` subfolder. Easiest is to make **`tapp` itself**
the repository root.

Open a terminal in the project folder and run:

```bash
cd C:\Users\strat\Downloads\tappNew\tapp
git init
git add .
git commit -m "TAPP: Analyze, Copilot, Trade, Dashboard"
```

Then create an empty repo on https://github.com/new (name it e.g. `tapp`, leave it
empty — no README/.gitignore), and connect + push:

```bash
git remote add origin https://github.com/<your-username>/tapp.git
git branch -M main
git push -u origin main
```

> `.gitignore` already excludes `.env`, `node_modules/`, and `dist/`, so your API
> keys and build files will **not** be uploaded. Good.

---

## 2. Import into Vercel

1. Go to https://vercel.com and sign in **with GitHub** (free Hobby plan is fine).
2. Click **Add New… → Project**, then **Import** your `tapp` repo.
3. Vercel auto-fills: Framework **Vite**, Build `npm run build`, Output `dist`.
   - If you pushed the whole `tappNew` folder instead of `tapp`, set
     **Root Directory = `tapp`** on this screen.
4. **Don't deploy yet** — add your keys first (next step).

---

## 3. Add your API keys (Environment Variables)

On the import screen (or later under **Project → Settings → Environment Variables**),
add these two, for the **Production** (and Preview) environment:

| Name                            | Value                          |
| ------------------------------- | ------------------------------ |
| `VITE_CLERK_PUBLISHABLE_KEY`    | your Clerk publishable key (`pk_...`) |
| `VITE_FINNHUB_KEY`              | your Finnhub API key           |

Then click **Deploy**.

> Note: `VITE_`-prefixed keys are bundled into the **client-side** JavaScript, so
> they're visible to anyone who views the site. That's expected and safe for the
> Clerk *publishable* key (it's designed to be public). Your Finnhub free-tier key
> will also be visible in the browser — fine for a demo, but if you want it hidden,
> that needs a small server/proxy later. Never put a Clerk **secret** key in a
> `VITE_` variable.

---

## 4. Done

Vercel gives you a permanent URL like `https://tapp-xxxx.vercel.app`. You can add a
custom domain under **Settings → Domains**.

**To update the live site:** just `git push` — Vercel rebuilds and redeploys
automatically.

---

## Clerk: allow your new domain

In your Clerk dashboard, add the Vercel URL (and any custom domain) to the app's
**allowed origins / domains** so sign-in works in production. Clerk's dashboard
prompts you to add production domains when you create production API keys.
