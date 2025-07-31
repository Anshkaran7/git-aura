# Monthly Winners System Setup

## Overview

The Monthly Winners system automatically captures and displays the top 3 developers from each month's leaderboard. The system runs automatically at month end and awards special badges to winners.

## Features

- **Automatic Data Capture**: Top 3 users are captured automatically at 11:50 PM on the last day of each month
- **Monthly Badges**: Winners receive special badge images (1st.png, 2nd.png, 3rd.png)
- **Beautiful Display**: Dedicated Monthly Winners page with responsive design
- **Historical Tracking**: View all past monthly winners with pagination
- **Badge Management**: Automatic badge awarding with tracking

## Database Schema

### MonthlyWinners Table

```sql
CREATE TABLE monthly_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month_year VARCHAR NOT NULL, -- Format: "YYYY-MM"
  rank INTEGER NOT NULL CHECK (rank IN (1, 2, 3)),
  total_aura INTEGER DEFAULT 0,
  contributions_count INTEGER DEFAULT 0,
  badge_awarded BOOLEAN DEFAULT FALSE,
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(user_id, month_year),
  UNIQUE(month_year, rank)
);
```

## API Endpoints

### 1. Save Monthly Winners

- **Endpoint**: `/api/save-monthly-winners`
- **Method**: POST
- **Purpose**: Captures top 3 users from current month's leaderboard
- **Security**: Requires `CRON_SECRET` authorization header

```bash
curl -X POST "https://your-domain.com/api/save-monthly-winners" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

### 2. Monthly Winners Cron

- **Endpoint**: `/api/cron/save-monthly-winners`
- **Method**: POST
- **Purpose**: Cron job endpoint that calls save-monthly-winners
- **Schedule**: Last day of month at 11:50 PM

### 3. Fetch Monthly Winners

- **Endpoint**: `/api/monthly-winners`
- **Method**: GET
- **Purpose**: Retrieve monthly winners data for display
- **Params**: `page`, `limit`, `monthYear`

```bash
# Get all winners (paginated)
curl "https://your-domain.com/api/monthly-winners?page=1&limit=6"

# Get specific month winners
curl "https://your-domain.com/api/monthly-winners?monthYear=2024-01"
```

## Cron Job Setup

### Option 1: Vercel Cron (Recommended for Vercel deployments)

1. Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/save-monthly-winners",
      "schedule": "50 23 L * *"
    }
  ]
}
```

2. Set environment variables in Vercel:
   - `CRON_SECRET`: A secure secret for cron job authentication
   - `NEXT_PUBLIC_APP_URL`: Your app's URL

### Option 2: GitHub Actions

Create `.github/workflows/monthly-winners.yml`:

```yaml
name: Monthly Winners Capture
on:
  schedule:
    # Run at 11:50 PM on the last day of each month
    - cron: "50 23 L * *"
  workflow_dispatch: # Allow manual triggering

jobs:
  capture-winners:
    runs-on: ubuntu-latest
    steps:
      - name: Call Monthly Winners API
        run: |
          curl -X POST "${{ secrets.APP_URL }}/api/cron/save-monthly-winners" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

### Option 3: External Cron Service

Use services like:

- **Cron-job.org**
- **EasyCron**
- **Cronitor**

Configure them to call:

```
POST https://your-domain.com/api/cron/save-monthly-winners
Headers:
  Authorization: Bearer YOUR_CRON_SECRET
  Content-Type: application/json
```

## Environment Variables

Add these to your `.env.local`:

```env
# Required for cron job authentication
CRON_SECRET=your-secure-cron-secret-here

# Your app URL (for internal API calls)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database URL (already exists)
DATABASE_URL=your-database-url
```

## Manual Testing

### Test Monthly Winners Capture

```bash
# Test saving current month's winners
curl -X POST "http://localhost:3000/api/save-monthly-winners" \
  -H "Authorization: Bearer your-cron-secret" \
  -H "Content-Type: application/json"

# Test cron endpoint
curl -X POST "http://localhost:3000/api/cron/save-monthly-winners" \
  -H "Authorization: Bearer your-cron-secret" \
  -H "Content-Type: application/json"
```

### Test Data Retrieval

```bash
# View monthly winners
curl "http://localhost:3000/api/monthly-winners"

# View specific month
curl "http://localhost:3000/api/monthly-winners?monthYear=2024-01"
```

## Badge System Integration

### Badge Images

Place badge images in `/public/badge/`:

- `1st.png` - Gold badge for 1st place
- `2nd.png` - Silver badge for 2nd place
- `3rd.png` - Bronze badge for 3rd place

### Automatic Badge Awarding

When monthly winners are captured, the system automatically:

1. Creates monthly badge entries in the `badges` table
2. Awards badges to top 3 users via `user_badges` table
3. Updates `badge_awarded` status in `monthly_winners` table

## Page Access

- **URL**: `/monthly-winners`
- **Features**:
  - Responsive design with gradient background
  - Badge images displayed prominently
  - User avatars and stats
  - Pagination for historical data
  - Links to user profiles

## Monitoring

### Check Cron Job Status

```bash
# Check if cron endpoint is working
curl "http://localhost:3000/api/cron/save-monthly-winners"
```

### Database Queries

```sql
-- Check monthly winners
SELECT * FROM monthly_winners ORDER BY month_year DESC, rank ASC;

-- Check badge awarding status
SELECT mw.month_year, mw.rank, u.github_username, mw.badge_awarded
FROM monthly_winners mw
JOIN users u ON mw.user_id = u.id
ORDER BY mw.month_year DESC, mw.rank ASC;

-- Check monthly badges
SELECT b.name, b.icon, b.is_monthly, b.created_at
FROM badges b
WHERE b.is_monthly = true
ORDER BY b.created_at DESC;
```

## Troubleshooting

### Common Issues

1. **Cron job not running**

   - Check `CRON_SECRET` environment variable
   - Verify cron schedule syntax
   - Check server logs for errors

2. **No winners captured**

   - Ensure monthly leaderboard has data
   - Check for banned users (they're excluded)
   - Verify database connectivity

3. **Badges not awarded**

   - Check badge creation in `badges` table
   - Verify `award-badges` API is working
   - Check `user_badges` table for entries

4. **Page not displaying data**
   - Check API endpoint responses
   - Verify database queries
   - Check browser console for errors

### Debug Commands

```bash
# Check monthly leaderboard data
curl "http://localhost:3000/api/leaderboard/monthly"

# Check badge system
curl "http://localhost:3000/api/award-badges"

# Manual badge awarding
curl -X POST "http://localhost:3000/api/award-badges"
```

## Production Deployment

1. **Set Environment Variables**

   ```bash
   CRON_SECRET=production-secret-key
   NEXT_PUBLIC_APP_URL=https://your-production-domain.com
   ```

2. **Configure Cron Service**

   - Set up your chosen cron solution
   - Test with manual triggers first
   - Monitor for the first few months

3. **Database Migration**

   ```bash
   npx prisma migrate deploy
   ```

4. **Test End-to-End**
   - Manually trigger monthly capture
   - Check page display
   - Verify badge awarding

## Success Metrics

- Monthly winners captured automatically
- Badges awarded to top 3 users
- Historical data preserved
- Page loads and displays correctly
- Navigation links working
- Mobile responsiveness maintained

This system provides a complete solution for recognizing and celebrating top contributors each month! 🏆
