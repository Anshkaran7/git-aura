![git-aura UI Preview](public/layout.png)

_Preview of the git-aura user profile interface_

# Git Aura 🚀

Git-Aura is the ultimate developer platform that transforms your hard-earned commits and repositories into a social flex. Show off your coding achievements with beautiful visualizations and compete on leaderboards!

## ✨ Features

- **GitHub Integration**: Seamlessly sync your GitHub contributions and repositories
- **Aura System**: Advanced scoring algorithm based on contributions, streaks, and consistency
- **Leaderboards**: Compete on monthly and all-time leaderboards
- **Badge System**: Earn badges for various achievements and milestones
- **Profile Cards**: Beautiful, shareable profile cards with your stats
- **Real-time Updates**: Automatic syncing of your GitHub data
- **Admin Panel**: User management and moderation tools
- **Modern UI**: Built with Next.js 14, TypeScript, and Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript for type safety
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS with custom components
- **Deployment**: Optimized for Vercel
- **APIs**: GitHub API, ImgBB for image uploads

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- GitHub account
- Clerk account for authentication

### 1. Clone the Repository

```bash
git clone https://github.com/Anshkaran7/git-aura.git
cd git-aura
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env.local
```

Fill in your environment variables (see [Environment Variables](#environment-variables) section below).

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view your app.

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/gitaura"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# GitHub API (Server-side only)
GITHUB_TOKEN=ghp_your_github_personal_access_token

# Image Upload (Server-side only)
IMGBB_API_KEY=your_imgbb_api_key

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Optional Variables

```env
# Clerk URLs (defaults provided)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 📋 Setup Guides

### GitHub API Setup

1. Create a GitHub Personal Access Token:
   - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Generate a new token with `public_repo` and `user:read` scopes
   - Add it to your `.env.local` as `GITHUB_TOKEN`

### Clerk Authentication Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Configure your authentication settings
3. Set up webhooks for user sync (see [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md))

### Database Setup

1. Create a PostgreSQL database
2. Update your `DATABASE_URL` in `.env.local`
3. Run Prisma migrations: `npx prisma db push`

### Image Upload Setup

1. Create an ImgBB account at [imgbb.com](https://imgbb.com)
2. Get your API key from the account settings
3. Add it to your `.env.local` as `IMGBB_API_KEY`

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
│   ├── lib/               # Utility functions and configurations
│   └── types/             # TypeScript type definitions
├── prisma/                # Database schema and migrations
├── public/                # Static assets
└── scripts/               # Utility scripts
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app is compatible with any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📚 Documentation

- [Environment Setup](./ENVIRONMENT_SETUP.md) - Detailed environment configuration
- [GitHub API Setup](./GITHUB_API_SETUP.md) - GitHub integration guide
- [Webhook Setup](./WEBHOOK_SETUP.md) - Clerk webhook configuration
- [Badge System](./BADGE_SYSTEM.md) - Badge system documentation
- [Setup Guide](./SETUP.md) - Complete setup walkthrough

## 🐛 Troubleshooting

### Common Issues

1. **Missing GitHub data**: Ensure your `GITHUB_TOKEN` is set correctly
2. **Database connection errors**: Check your `DATABASE_URL` and database status
3. **Authentication issues**: Verify your Clerk configuration
4. **Image upload failures**: Confirm your `IMGBB_API_KEY` is valid

### Getting Help

- Check the [documentation](./docs/) for detailed guides
- Search existing [issues](https://github.com/Anshkaran7/git-aura/issues)
- Create a new issue with detailed information about your problem

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with ❤️ using Next.js and TypeScript
- GitHub API for contribution data
- Clerk for authentication
- All contributors who help improve this project

---

**Ready to show off your coding achievements?** Get started with Git Aura today! 🚀

