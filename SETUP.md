# GitAura Setup Guide

A beautiful GitHub profile visualizer with an aura system, leaderboards, and badges.

## ✨ Features

- **GitHub Profile Visualization**: Beautiful contribution graphs and statistics
- **Aura System**: Calculate coding aura based on contributions, streaks, and consistency
- **User Authentication**: Secure sign-in with Clerk + GitHub OAuth
- **Leaderboards**: Monthly and global rankings with real-time updates
- **Badge System**: Earn badges for achievements and share them
- **Multiple Themes**: Light, Dark, and Ocean Dark themes
- **Social Sharing**: Share profiles, badges, and achievements

## 🔧 Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# GitHub API
NEXT_PUBLIC_GITHUB_TOKEN=your-github-token

# ImgBB (for image uploads)
NEXT_PUBLIC_IMGBB_API_KEY=your-imgbb-api-key

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Clerk Setup

1. Create a [Clerk](https://clerk.com) account
2. Create a new application
3. Enable GitHub OAuth provider:
   - Go to "Social Providers" in Clerk dashboard
   - Enable GitHub
   - Add GitHub OAuth app credentials
4. Configure sign-in/sign-up pages:
   - Set sign-in URL: `/sign-in`
   - Set sign-up URL: `/sign-up`
   - Set after sign-in URL: `/`
   - Set after sign-up URL: `/`

### 3. Supabase Database Setup

1. Create a [Supabase](https://supabase.com) account
2. Create a new project
3. Run the database schema from `database/schema.sql`:
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the schema
   - Execute the queries
4. Enable Row Level Security (RLS) policies
5. Get your project URL and API keys

### 4. GitHub Token Setup

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with the following scopes:
   - `public_repo` (to read public repositories)
   - `read:user` (to read user profile)
3. Add the token to your environment variables

### 5. ImgBB Setup (Optional)

1. Create an [ImgBB](https://imgbb.com/api) account
2. Get your API key
3. Add it to environment variables (used for badge image sharing)

### 6. Install Dependencies

```bash
npm install
```

### 7. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🎮 How It Works

### Aura System

The aura system calculates points based on:

1. **Base Aura**: Points for daily contributions

   - 0 contributions: -10 points (penalty)
   - 1-2 contributions: 5 points each
   - 3-5 contributions: 8 points each
   - 6-10 contributions: 12 points each
   - 10+ contributions: 15 points each

2. **Streak Bonus**: Additional points for consecutive days

   - 2 points per day in streak (max 100 bonus)

3. **Consistency Bonus**: Extra points for above-average activity
   - 10 points when above personal average

### Badge System

Users can earn badges for:

- **Monthly Champions**: Top 3 users each month
- **Streak Master**: 30+ day contribution streak
- **Century Club**: 100+ contributions in a month
- **Daily Grinder**: 365+ day contribution streak
- **Code Warrior**: 1000+ total aura points
- **Aura Legend**: 5000+ total aura points

### Leaderboards

- **Monthly Leaderboard**: Reset every month, compete for monthly badges
- **Global Leaderboard**: All-time rankings based on total aura

## 📱 Usage

1. **View Any GitHub Profile**: Enter a username to see their contributions and aura
2. **Sign In**: Authenticate with GitHub to save your aura and compete
3. **Earn Badges**: Achieve milestones to unlock badges
4. **Compete**: Check leaderboards to see your ranking
5. **Share**: Share your profile, badges, and achievements

## 🎨 Themes

- **Light**: Clean, bright interface
- **Dark**: GitHub-inspired dark theme
- **Ocean Dark**: Blue-tinted dark theme with gradients

## 🔒 Privacy & Security

- Only public GitHub data is accessed
- User authentication handled by Clerk
- Row Level Security (RLS) enabled on all database tables
- No sensitive data stored

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy

### Other Platforms

1. Build the application: `npm run build`
2. Deploy the `dist` folder
3. Ensure environment variables are set

## 🛠️ Development

### Database Schema

The application uses the following main tables:

- `users`: User profiles and aura data
- `aura_calculations`: Daily aura breakdowns
- `badges`: Available badges
- `user_badges`: User-earned badges
- `monthly_leaderboards`: Monthly rankings
- `global_leaderboard`: All-time rankings

### API Routes

- `/api/sync-user`: Sync user data with GitHub
- `/api/og`: Generate Open Graph images

### Key Components

- `GitHubProfileCard`: Main profile visualization
- `Leaderboard`: Rankings display
- `BadgeDisplay`: User badges management
- `AuraAnalysis`: Aura breakdown and statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the environment variables are correctly set
2. Ensure all services (Clerk, Supabase, GitHub) are properly configured
3. Check the browser console for errors
4. Create an issue on GitHub for further assistance

## 🎯 Roadmap

- [ ] Team competitions
- [ ] Custom badge creation
- [ ] Achievement streaks
- [ ] Integration with more Git platforms
- [ ] Advanced analytics dashboard
- [ ] Mobile app

---

Made with ❤️ by [Karan](https://karandev.in)
