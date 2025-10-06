# Deploy TakeoverTV to Vercel (5 Minutes)

## Quick Deploy - No CLI Needed!

### Step 1: Push to GitHub

**Create a GitHub repository:**
```
1. Go to: https://github.com/new
2. Repository name: takeover-tv-minapp
3. Make it Public or Private (your choice)
4. Don't initialize with README (you already have one)
5. Click "Create repository"
```

**Push your code:**
```bash
# Copy the commands GitHub shows you, they'll look like:
git remote add origin https://github.com/YOUR_USERNAME/takeover-tv-minapp.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

**Connect to Vercel:**
```
1. Go to: https://vercel.com/new
2. Sign up/Login (use GitHub account for easiest setup)
3. Click "Import Project"
4. Find your "takeover-tv-minapp" repository
5. Click "Import"
```

**Configure Environment Variables:**

Click "Environment Variables" and add these:

```
NEXT_PUBLIC_TELEVISION_ADDRESS=0x46Fcd75Dd8cB75e678D078353e8C3fd32671f215
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_APP_NAME=TakeoverTV
```

**Important:** Don't add `NEXT_PUBLIC_APP_DOMAIN` yet - Vercel will give you the domain!

**Click "Deploy"** → Wait 1-2 minutes

### Step 3: Get Your URL

After deployment completes:
```
You'll get a URL like:
https://takeover-tv-minapp.vercel.app

OR custom:
https://takeover-tv-abc123.vercel.app
```

**Copy this URL!**

### Step 4: Update App Domain

**Add the final environment variable:**
```
1. In Vercel dashboard, go to your project
2. Click "Settings" → "Environment Variables"
3. Add one more variable:
   - Name: NEXT_PUBLIC_APP_DOMAIN
   - Value: takeover-tv-minapp.vercel.app (just the domain, no https://)
4. Click "Save"
```

**Redeploy:**
```
1. Go to "Deployments" tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Wait 1 minute
```

### Step 5: Test Your Mini App!

**Test in Farcaster Preview:**
```
1. Go to: https://farcaster.xyz/~/developers/mini-apps/preview
2. Enter your Vercel URL: https://takeover-tv-minapp.vercel.app
3. Your wallet should auto-connect!
```

**Or test in Warpcast:**
```
1. Open Warpcast app
2. Create a new cast
3. Paste your Vercel URL
4. Post it
5. Click on the cast
6. Open the Mini App
7. Everything should work!
```

## Alternative: Deploy via Vercel CLI

If you prefer the command line:

```bash
# Login to Vercel
npx vercel login

# Deploy
npx vercel --prod

# Follow the prompts:
# - Set up and deploy: Y
# - Which scope: [your account]
# - Link to existing project: N
# - Project name: takeover-tv-minapp
# - Directory: ./
# - Override settings: N

# Then add environment variables:
npx vercel env add NEXT_PUBLIC_TELEVISION_ADDRESS
# Enter: 0x46Fcd75Dd8cB75e678D078353e8C3fd32671f215

npx vercel env add NEXT_PUBLIC_CHAIN_ID
# Enter: 84532

npx vercel env add NEXT_PUBLIC_RPC_URL
# Enter: https://sepolia.base.org

npx vercel env add NEXT_PUBLIC_APP_NAME
# Enter: TakeoverTV

# After you get your deployment URL, add:
npx vercel env add NEXT_PUBLIC_APP_DOMAIN
# Enter: your-deployment-url.vercel.app

# Redeploy
npx vercel --prod
```

## What You'll Get

✅ **Production URL:** `https://takeover-tv-minapp.vercel.app`
✅ **HTTPS automatically**
✅ **Fast global CDN**
✅ **Auto-deploys on git push**
✅ **Free hosting**

## Next Steps After Deployment

### 1. Test It Works

Visit your Vercel URL directly:
- Should see the app
- "Connect Wallet" button shows
- Video player shows "STANDBY"

### 2. Test in Farcaster Preview

```
https://farcaster.xyz/~/developers/mini-apps/preview
Enter your Vercel URL
Wallet should connect automatically!
```

### 3. Sign Your Manifest (For Production)

```
1. Go to: https://farcaster.xyz/~/developers
2. Enable "Developer Mode"
3. Click "Register Mini App"
4. Enter your Vercel domain
5. Sign the account association
6. Copy the accountAssociation JSON
7. Update app/api/manifest/route.ts with the values
8. Push to GitHub (auto-redeploys)
```

### 4. Share on Farcaster!

Once manifest is signed:
```
1. Create a cast in Warpcast
2. Share your Mini App
3. Users can open and use it!
```

## Troubleshooting

**Build fails:**
- Check the Vercel build logs
- Usually missing environment variables

**Wallet won't connect:**
- Make sure `NEXT_PUBLIC_APP_DOMAIN` is set correctly
- Make sure you redeployed after adding it
- Try in Farcaster preview tool

**"Module not found" errors:**
- Run `npm install` locally
- Push to GitHub
- Vercel will rebuild

## Pro Tip: Custom Domain

Want a custom domain like `takeover.tv`?

```
1. Buy domain on Namecheap, GoDaddy, etc.
2. In Vercel: Settings → Domains
3. Add your custom domain
4. Update DNS records (Vercel shows you how)
5. Update NEXT_PUBLIC_APP_DOMAIN to your custom domain
6. Redeploy
```

---

**You're ready to deploy! Choose GitHub + Vercel (easiest) or CLI method above.** 🚀
