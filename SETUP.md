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
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Admin Panel**: User management and moderation tools

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/Anshkaran7/git-aura.git
cd git-aura
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp env.example .env.local
```

Fill in your environment variables (see [Environment Setup Guide](./ENVIRONMENT_SETUP.md) for detailed instructions).

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to NeonDB
npx prisma db push

# (Optional) View your data
npx prisma studio
```

### 4. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

## 📋 Required Services Setup

### 1. NeonDB Database

1. Go to [neon.tech](https://neon.tech) and create account
2. Create new project
3. Copy connection string to `DATABASE_URL`
4. Run `npx prisma db push` to create tables

### 2. Clerk Authentication

1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. Enable GitHub OAuth provider
4. Copy keys to environment variables

### 3. GitHub API Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate new token with `public_repo` and `user:read` scopes
3. Add to `GITHUB_TOKEN` environment variable

### 4. ImgBB (Optional)

1. Create account at [imgbb.com](https://imgbb.com)
2. Get API key from settings
3. Add to `IMGBB_API_KEY` environment variable

## 🎯 Task Guidelines

### For Contributors

When working on issues, follow these guidelines:

1. **Read the Issue**: Understand the problem completely
2. **Test Locally**: Reproduce the issue on your machine
3. **Check Existing Code**: Look at similar implementations
4. **Follow Code Style**: Use TypeScript, functional components, Tailwind CSS
5. **Test Responsively**: Ensure it works on mobile, tablet, and desktop
6. **Add Documentation**: Update docs if needed

### Code Standards

- **TypeScript**: Use strict typing, interfaces over types
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS with custom components
- **Testing**: Test on multiple screen sizes
- **Performance**: Optimize for mobile and slow connections

### UI/UX Guidelines

- **Responsive**: Must work on all screen sizes
- **Accessible**: Follow WCAG guidelines
- **Modern**: Clean, professional design
- **Fast**: Optimize loading times
- **Intuitive**: Easy to use and understand

## 🏗️ Project Structure

```
git-aura/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── [username]/     # User profile pages
│   │   └── admin/          # Admin panel
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── leaderboard/   # Leaderboard components
│   │   └── home/          # Homepage components
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript definitions
├── prisma/                # Database schema
├── public/                # Static assets
└── scripts/               # Utility scripts
```

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
- Database security with NeonDB
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

The application uses these main tables:

- `users`: User profiles and aura data
- `aura_calculations`: Daily aura breakdowns
- `badges`: Available badges
- `user_badges`: User-earned badges
- `monthly_leaderboards`: Monthly rankings
- `global_leaderboard`: All-time rankings

### API Routes

- `/api/sync-user`: Sync user data with GitHub
- `/api/og`: Generate Open Graph images
- `/api/leaderboard/*`: Leaderboard data
- `/api/badges/*`: Badge management

### Key Components

- `GitHubProfileCard`: Main profile visualization
- `Leaderboard`: Rankings display
- `BadgeDisplay`: User badges management
- `AuraAnalysis`: Aura breakdown and statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the guidelines above
4. Test thoroughly on different devices
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the environment variables are correctly set
2. Ensure all services (Clerk, NeonDB, GitHub) are properly configured
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
