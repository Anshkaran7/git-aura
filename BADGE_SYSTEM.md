# Badge System Documentation

## Overview

The badge system automatically awards exclusive badges to the top 3 performing developers each month based on their aura scores in the monthly leaderboard.

## Badge Types

### Monthly Top 3 Badges

1. **🏆 Monthly Champion** (Position #1)

   - Rarity: Legendary
   - Color: Gold (#FFD700)
   - Description: "Crowned #1 developer of the month! 🏆"

2. **🥈 Monthly Runner-up** (Position #2)

   - Rarity: Epic
   - Color: Silver (#C0C0C0)
   - Description: "Amazing work! Secured #2 position! 🥈"

3. **🥉 Monthly Bronze** (Position #3)
   - Rarity: Rare
   - Color: Bronze (#CD7F32)
   - Description: "Excellent performance! Earned #3 spot! 🥉"

## How It Works

### Automatic Badge Awarding

1. **Trigger**: Badges are automatically awarded when user aura is calculated and stored
2. **Process**: The system calls `/api/award-badges` in the background
3. **Frequency**: Happens every time a user's aura is updated
4. **Protection**: Duplicate badges are prevented by checking existing awards

### Badge Display

- Only users in the top 3 positions receive badges
- Users outside top 3 see encouragement to reach the elite tier
- Badges are displayed with animated effects and rarity indicators

## API Endpoints

### 1. `/api/award-badges`

**POST**: Awards badges to current month's top 3 users
**GET**: Check current badge status and top users

```bash
# Award badges automatically
curl -X POST http://localhost:3000/api/award-badges

# Check badge status
curl http://localhost:3000/api/award-badges
```

### 2. `/api/manual-award-badges`

**POST**: Manually trigger badge awarding (requires authentication)
**GET**: Show usage instructions

```bash
# Manual badge awarding (requires API key)
curl -X POST http://localhost:3000/api/manual-award-badges \
  -H "Authorization: Bearer YOUR_BADGE_ADMIN_KEY" \
  -H "Content-Type: application/json"
```

## Environment Variables

### Required for Badge System

```env
# Your Neon database URL
DATABASE_URL="postgresql://..."

# Optional: App URL for badge awarding API calls
NEXT_PUBLIC_APP_URL="https://your-app-domain.com"

# Optional: Admin key for manual badge awarding
BADGE_ADMIN_KEY="your-secure-admin-key"
```

## Database Schema

### Badges Table

```sql
- id: UUID (Primary Key)
- name: String (Unique badge name with month-year)
- description: String (Badge description)
- icon: String (Emoji or icon)
- color: String (Hex color code)
- rarity: Enum (COMMON, RARE, EPIC, LEGENDARY)
- isMonthly: Boolean (True for monthly badges)
- isActive: Boolean (Badge is currently active)
- criteria: JSON (Award criteria)
```

### UserBadges Table

```sql
- id: UUID (Primary Key)
- userId: String (User ID)
- badgeId: String (Badge ID)
- monthYear: String (Format: "2025-01")
- rank: Integer (Position when badge was earned)
- earnedAt: DateTime (When badge was awarded)
- metadata: JSON (Additional data like aura score)
```

## Testing the Badge System

### 1. Check Current Status

```bash
curl http://localhost:3000/api/award-badges
```

### 2. Manual Badge Award

```bash
curl -X POST http://localhost:3000/api/manual-award-badges \
  -H "Authorization: Bearer admin-key-123" \
  -H "Content-Type: application/json"
```

### 3. View User Badges

- Visit `/user/[username]` and navigate to badges section
- Only top 3 users will see their badges
- Others will see encouragement message

## Integration Points

### 1. Aura Calculation System

- Located in `src/lib/aura-calculations.ts`
- Automatically calls badge awarding after leaderboard updates
- Background process, doesn't affect aura calculation if it fails

### 2. Badge Display Component

- Located in `src/components/BadgeDisplay.tsx`
- Uses monthly leaderboard API to determine user position
- Shows badges only for top 3 positions

### 3. Leaderboard APIs

- Monthly: `/api/leaderboard/monthly`
- All-time: `/api/leaderboard/alltime`
- Both support pagination and user rank lookup

## Troubleshooting

### Common Issues

1. **Badges not appearing**

   - Check if user is in top 3 of monthly leaderboard
   - Verify badge awarding API is being called
   - Check database for badge records

2. **Badge awarding fails**

   - Check console logs for error messages
   - Verify database connection and Prisma schema
   - Ensure all required fields are present

3. **Manual badge awarding unauthorized**
   - Set `BADGE_ADMIN_KEY` environment variable
   - Use correct Authorization header format

### Debug Commands

```bash
# Check monthly leaderboard
curl "http://localhost:3000/api/leaderboard/monthly"

# Check badge status
curl "http://localhost:3000/api/award-badges"

# Check user badges
curl "http://localhost:3000/api/leaderboard/monthly?userId=USER_ID"
```

## Future Enhancements

1. **Additional Badge Types**

   - Streak badges (7, 30, 100 day streaks)
   - Contribution milestone badges
   - Special event badges

2. **Badge Notifications**

   - Email notifications when badges are earned
   - In-app notification system

3. **Badge Trading/Collections**

   - User badge collection page
   - Badge sharing on social media
   - Badge rarity statistics

4. **Automated Scheduling**
   - Cron job for end-of-month badge awarding
   - Automated badge cleanup for inactive users
