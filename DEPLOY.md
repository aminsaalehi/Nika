# Deploy Your Site Online

This guide walks you through publishing your site so you can share it with a public URL.

## Prerequisites

- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (free; sign up with GitHub)

## Step 1: Push to GitHub

The project is already a git repo with an initial commit. Push it to GitHub:

1. Create a new repository at [github.com/new](https://github.com/new)
   - Name it (e.g. `hero-particles` or `nika-agency`)
   - Leave it empty (no README, .gitignore, or license)

2. In your terminal, from the project folder:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name.

## Step 2: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub if prompted
3. Click **Import** next to your repository
4. Keep the default settings (Framework Preset: Next.js, Build Command: `next build`, etc.)
5. Click **Deploy**
6. Wait 1–2 minutes for the build to finish

## Step 3: Share Your URL

Once deployed, Vercel gives you a URL like:

```
https://your-project-name.vercel.app
```

- Share this link with anyone
- It works on desktop and mobile
- Future pushes to `main` will auto-deploy

## Alternative: Vercel CLI

If you prefer the command line:

```bash
npm i -g vercel
vercel login
vercel
```

Follow the prompts to link the project and deploy.
