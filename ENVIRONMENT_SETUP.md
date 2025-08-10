# Environment Variables Setup

This document explains the environment variables required for GitAura application.

## 🚀 Quick Setup

1. Copy `env.example` to `.env.local`
2. Fill in your values (see sections below)
3. Run `npm run dev` to start

## 📋 Required Environment Variables

### Database (NeonDB)

```env
# NeonDB PostgreSQL Connection
DATABASE_URL="postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/database?sslmode=require"
```

**How to get NeonDB URL:**

1. Go to [neon.tech](https://neon.tech) and create account
2. Create new project
3. Copy the connection string from dashboard
4. Replace `[YOUR-PASSWORD]` with your actual password

### GitHub API (Server-side only - SECURE)

```env
# GitHub Personal Access Token
GITHUB_TOKEN=ghp_your_github_personal_access_token_here
```

**How to create GitHub token:**

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: `public_repo`, `user:read`
4. Copy the token immediately

### Image Upload (Server-side only - SECURE)

```env
# ImgBB API Key for image uploads
IMGBB_API_KEY=your_imgbb_api_key_here
```

**How to get ImgBB key:**

1. Go to [imgbb.com](https://imgbb.com) and create account
2. Go to API section in settings
3. Copy your API key

### Clerk Authentication

```env
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

**How to setup Clerk:**

1. Go to [clerk.com](https://clerk.com) and create account
2. Create new application
3. Enable GitHub OAuth provider
4. Copy the keys from dashboard

### Application Configuration

```env
# Your app URL (for internal API calls)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Cron job secret (for automated tasks)
CRON_SECRET=your-secure-random-string-here
```

## 🔒 Security Notes

### ✅ Secure (Server-side only)

- `GITHUB_TOKEN` - Never exposed to client
- `IMGBB_API_KEY` - Never exposed to client
- `CLERK_SECRET_KEY` - Never exposed to client
- `CRON_SECRET` - Never exposed to client

### ⚠️ Public (Client-side accessible)

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Safe to expose
- `NEXT_PUBLIC_BASE_URL` - Safe to expose

## 🗄️ Database Migration

After setting up NeonDB:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) View your data
npx prisma studio
```

## 🧪 Testing Your Setup

1. **Test Database Connection:**

   ```bash
   npx prisma db push
   ```

2. **Test GitHub API:**

   ```bash
   curl "http://localhost:3000/api/github/test-token"
   ```

3. **Test Clerk Auth:**
   - Visit `/sign-in` page
   - Try signing in with GitHub

## 🚨 Common Issues

### "Database connection failed"

- Check your `DATABASE_URL` format
- Ensure NeonDB project is active
- Verify password in connection string

### "GitHub API rate limit"

- Add `GITHUB_TOKEN` to increase limits
- Check token has correct scopes

### "Authentication not working"

- Verify Clerk keys are correct
- Check GitHub OAuth is enabled in Clerk
- Ensure redirect URLs are set correctly

## 📝 Example .env.local

```env
# Database
DATABASE_URL="postgresql://john:password123@ep-cool-name-123456.us-east-1.aws.neon.tech/gitaura?sslmode=require"

# GitHub API
GITHUB_TOKEN=ghp_1234567890abcdef1234567890abcdef12345678

# Image Upload
IMGBB_API_KEY=1234567890abcdef1234567890abcdef

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_1234567890abcdef
CLERK_SECRET_KEY=sk_test_1234567890abcdef
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# App Config
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CRON_SECRET=my-super-secret-cron-key-123
```

## 🆘 Need Help?

1. Check browser console for errors
2. Verify all environment variables are set
3. Test each service individually
4. Create an issue on GitHub with error details
