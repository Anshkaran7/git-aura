# Cron Job Setup for GitAura

This document explains how to set up automatic data refresh for your GitAura application.

## Environment Variables

Add these to your `.env.local` file:

```bash
CRON_SECRET=your-secure-random-string-here
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

Generate a secure random string for `CRON_SECRET`:

```bash
openssl rand -base64 32
```

## Option 1: Vercel Cron Jobs (Recommended)

If you're deploying on Vercel, the `vercel.json` file is already configured with cron jobs:

- **Refresh all users**: Every 2 hours (`0 */2 * * *`)
- **Update ranks**: Every 4 hours (`0 */4 * * *`)

The cron jobs will automatically call:

- `/api/cron/refresh-all-users` - Refreshes GitHub contribution data for all users
- `/api/cron/update-ranks` - Updates leaderboard rankings

## Option 2: GitHub Actions (Alternative)

If you're not using Vercel, you can use GitHub Actions:

1. Add the `CRON_SECRET` to your GitHub repository secrets
2. Update the domain in `.github/workflows/cron-refresh.yml`
3. The workflow will run every 2 hours automatically

## Option 3: External Cron Service

You can use external cron services like:

- [cron-job.org](https://cron-job.org) (Free)
- [EasyCron](https://www.easycron.com) (Free tier available)

Set up a cron job to call:

```
POST https://your-domain.com/api/cron/refresh-all-users
Headers:
  Authorization: Bearer your-cron-secret
```

## How It Works

### Smart Refresh Logic

The system uses intelligent refresh logic based on user activity:

- **Active users** (contributions in last 7 days): Refresh every 2 hours
- **Semi-active users** (contributions in last 30 days): Refresh every 6 hours
- **Inactive users**: Refresh once per day

### Manual Refresh

Users can also trigger refresh by:

1. Viewing their own profile (automatic refresh)
2. Using the `/api/refresh-user-aura` endpoint
3. Running the manual script: `node scripts/refresh-all-users.js`

### API Endpoints

- `POST /api/cron/refresh-all-users` - Refresh all user data
- `POST /api/cron/update-ranks` - Update leaderboard rankings
- `POST /api/refresh-user-aura` - Refresh specific user

All endpoints require the `CRON_SECRET` authorization header.

## Monitoring

Check your application logs for:

- `[Cron] Starting refresh for X users`
- `[Cron] Refresh completed: X successful, Y failed`
- `[Sync] Refreshing data for username: reason`
- `[Sync] Skipping refresh for username: reason`

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**: Check that `CRON_SECRET` is set correctly
2. **Rate limit errors**: The system includes delays between batches to respect GitHub API limits
3. **Database connection errors**: Check your database connection string
4. **Missing environment variables**: Ensure all required env vars are set

### Manual Testing

Test the cron endpoints manually:

```bash
# Test refresh endpoint
curl -X POST https://your-domain.com/api/cron/refresh-all-users \
  -H "Authorization: Bearer your-cron-secret" \
  -H "Content-Type: application/json"

# Test rank update endpoint
curl -X POST https://your-domain.com/api/cron/update-ranks \
  -H "Authorization: Bearer your-cron-secret" \
  -H "Content-Type: application/json"
```

### Debug Mode

Run the manual refresh script with verbose logging:

```bash
node scripts/refresh-all-users.js --verbose --users=test_user
```

## Security

- The `CRON_SECRET` should be a long, random string
- Never commit the secret to version control
- Use different secrets for development and production
- Regularly rotate the secret

## Performance

- Batch processing prevents overwhelming the GitHub API
- Delays between batches respect rate limits
- Smart refresh logic minimizes unnecessary API calls
- Background processing prevents blocking user requests
