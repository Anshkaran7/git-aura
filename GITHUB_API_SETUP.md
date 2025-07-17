# GitHub API Setup - Fix Missing Contributions Data

If you're seeing incomplete GitHub contributions data in GitAura, it's likely due to GitHub API rate limiting or missing authentication. Here's how to fix it:

## 🔧 **Quick Fix: Add GitHub Token**

### Step 1: Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name like `GitAura API Token`
4. Set expiration (recommended: 90 days or No expiration for development)
5. **Important**: Select these scopes:

   - `public_repo` (access public repositories)
   - `user:read` (read user profile information)
   - ✅ **No additional scopes needed** (we only read public data)

6. Click **"Generate token"**
7. **Copy the token immediately** (you won't see it again!)

### Step 2: Add Token to Your Environment

Add this to your `.env.local` file:

```env
# GitHub API Token for increased rate limits
NEXT_PUBLIC_GITHUB_TOKEN=ghp_your_token_here_xxxxxxxxxxxxxxxxx

# Other existing variables...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
# ... etc
```

### Step 3: Restart Your Development Server

```bash
npm run dev
```

## 🚨 **Common Issues & Solutions**

### Issue 1: "No contributions data found"

**Cause**: Missing or invalid GitHub token
**Solution**: Follow steps above to add `NEXT_PUBLIC_GITHUB_TOKEN`

### Issue 2: Still showing limited data

**Cause**: Token might not have correct permissions
**Solution**: Regenerate token with `public_repo` and `user:read` scopes

### Issue 3: Rate limit errors

**Cause**: Too many API calls without authentication
**Solution**: Add the GitHub token - this increases rate limit from 60/hour to 5,000/hour

### Issue 4: Grid shows mostly empty squares

**Cause**: Date range calculation issues or API problems
**Solution**: Check browser console for errors and ensure token is set

## 🔍 **Testing the Fix**

1. Open browser developer tools (F12)
2. Go to Console tab
3. Search for any GitHub username
4. Look for these log messages:

   ```
   📅 Date range: {...}
   📊 Contributions Response: {...}
   📅 Contributions data: {...}
   🎯 Contribution Map Sample: {...}
   ```

5. If you see proper data in the logs, the fix worked!

## 📊 **Expected vs Actual Results**

### ✅ **After Fix (With Token)**

- Full contribution graph matching GitHub
- Accurate total contribution count
- All dates properly filled
- Smooth API responses

### ❌ **Before Fix (Without Token)**

- Missing contribution data
- Much lower contribution counts
- Empty grid squares
- API rate limit errors

## 🔒 **Security Notes**

- The token only has read access to public repositories
- It's used in the frontend (`NEXT_PUBLIC_*`) which is normal for GitHub API
- Never commit your `.env.local` file to version control
- Regenerate token if you suspect it's compromised

## 🚀 **Pro Tips**

1. **For Production**: Use environment variables in your hosting platform (Vercel, Netlify, etc.)
2. **Token Expiration**: Set calendar reminders to regenerate tokens before they expire
3. **Multiple Developers**: Each developer should use their own token
4. **Monitoring**: Watch the console logs to ensure API calls are working

---

After following this guide, your GitAura app should show complete GitHub contributions data matching what you see on GitHub.com!
