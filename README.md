![git-aura UI Preview](public/gitaura.webp)

_A Preview of the git-aura user profile interface_

<h4 **Git Aura**>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/Anshkaran7/git-aura)

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

*Git~Aura Overview**

> Git-Aura is the ultimate developer platform that transforms your hard-earned commits and repositories into a social flex. Show off your coding achievements with beautiful visualizations and compete on leaderboards!

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">
<div align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=24&duration=3000&pause=1000&color=00C853&center=true&vCenter=true&width=900&lines=Thanks+for+visiting+git-aura!+🙌;Start+the+repo+✅;Share+it+with+others+🌍;Contribute+and+grow+🛠️;Happy+Coding+✨!" alt="Thanks Banner Typing SVG" />
</div>
<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="150%">

**Project ~ Insights**

<table align="center">
    <thead align="center">
        <tr>
            <td><b> Stars</b></td>
            <td><b> Forks</b></td>
            <td><b> Issues</b></td>
            <td><b> Open PRs</b></td>
            <td><b> Closed PRs</b></td>
            <td><b> Languages</b></td>
            <td><b> Contributors</b></td>
        </tr>
     </thead>
    <tbody>
         <tr>
            <td><img alt="Stars" src="https://img.shields.io/github/stars/Anshkaran7/git-aura?style=flat&logo=github"/></td>
            <td><img alt="Forks" src="https://img.shields.io/github/forks/Anshkaran7/git-aura?style=flat&logo=github"/></td>
            <td><img alt="Issues" src="https://img.shields.io/github/issues/Anshkaran7/git-aura?style=flat&logo=github"/></td>
            <td><img alt="Open PRs" src="https://img.shields.io/github/issues-pr/Anshkaran7/git-aura?style=flat&logo=github"/></td>
            <td><img alt="Closed PRs" src="https://img.shields.io/github/issues-pr-closed/Anshkaran7/git-aura?style=flat&color=critical&logo=github"/></td>
            <td><img alt="Languages Count" src="https://img.shields.io/github/languages/count/Anshkaran7/git-aura?style=flat&color=green&logo=github"></td>
            <td><img alt="Contributors Count" src="https://img.shields.io/github/contributors/Anshkaran7/git-aura?style=flat&color=blue&logo=github"/></td>
        </tr>
    </tbody>
</table>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="150%">

## Git~Aura Features

- **GitHub Integration**: Seamlessly sync your GitHub contributions and repositories.
- **Aura System**: Advanced scoring algorithm based on contributions, streaks, and consistency.
- **Leaderboards**: Compete on monthly and all-time leaderboards.
- **Badge System**: Earn badges for various achievements and milestones.
- **Profile Cards**: Beautiful, shareable profile cards with your stats.
- **Real-time Updates**: Automatic syncing of your GitHub data.
- **Admin Panel**: User management and moderation tools.
- **Modern UI**: Built with Next.js 14, TypeScript, and Tailwind CSS.
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop platforms.

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

**🛠Mordern~Day Tech Stack**

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript for type safety
- **Database**: PostgreSQL with NeonDB and Prisma ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS with custom components
- **Deployment**: Optimized for Vercel
- **APIs**: GitHub API, ImgBB for image uploads

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

**🚀 Quick Start**

### Prerequisites For Use.

- Node.js 18+
- NeonDB PostgreSQL database
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
cp env.example .env.local
```

Fill in your environment variables (see [Environment Setup Guide](./ENVIRONMENT_SETUP.md) for detailed instructions).

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to NeonDB
npx prisma db push

# (Optional) View your data
npx prisma studio
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="150%">

Let’s make learning and career development smarter – together!

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="150%">

Open [http://localhost:3000](http://localhost:3000) to view your app.

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

## Environment Variables Components

Create a `.env.local` file in the root directory with the following variables:

### Required Variables For Enviromental Variables

```env
# Database (NeonDB)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/database?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# GitHub API (Server-side only)
GITHUB_TOKEN=ghp_your_github_personal_access_token

# Image Upload (Server-side only)
IMGBB_API_KEY=your_imgbb_api_key

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CRON_SECRET=your-secure-cron-secret
```

### Additional Optional Variables

```env
# Clerk URLs (defaults provided)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

## Application Setup Guides

### NeonDB Database Setup

1. Create a NeonDB account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from your dashboard
4. Update your `DATABASE_URL` in `.env.local`
5. Run Prisma migrations: `npx prisma db push`

### GitHub API Setup

1. Create a GitHub Personal Access Token:
   - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Generate a new token with `public_repo` and `user:read` scopes
   - Add it to your `.env.local` as `GITHUB_TOKEN`

### Clerk Authentication Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Configure your authentication settings
3. Enable GitHub OAuth provider
4. Set up webhooks for user sync

### Image Upload Setup

1. Create an ImgBB account at [imgbb.com](https://imgbb.com)
2. Get your API key from the account settings
3. Add it to your `.env.local` as `IMGBB_API_KEY`

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

**Git~Aura Official Project Structure**

```bash
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

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

**Deployment**

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

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="150%">

## Contributions

We always welcome contributions! Here's how you can help u:

Follow these steps to contribute your changes to **git~aura**:

1. **Star & Fork the Repository**  
   Click the **“Star”** button to support the project, then **“Fork”** the repo to create your own copy of the repo:  
   👉 [https://github.com/Anshkaran7/git-aura](https://github.com/Anshkaran7/git-aura)

2. **Clone Your Fork**  
   Use the following command to clone your forked repository to your local machine:
   ```bash
   git clone https://github.com/Your-Username/git-aura.git
   ```
3. Create a Branch
   Navigate to the project directory and create a new branch for your changes:

   ```bash
   cd git-aura
   git checkout -b my-feature-branch
   ```

4. Make Changes
   Add your new ML projects, games, websites, or enhancements. Fix bugs or improve UI/UX as needed.

5. Commit Your Changes
   Use a meaningful commit message:

   ```bash
   git add .
   git commit -m "[Feature Add] Add XYZ website project"
   ```

6. Push Your Changes
   Push your branch to your GitHub fork:

   ```bash
   git push origin my-feature-branch
   ```

7. Submit a Pull Request

   Go to your fork on GitHub.

   Click "Compare & pull request".

   Add a descriptive title using one of the prefixes: [UI], [UX], [Feature Add].

   Link the related issue (if any) and clearly describe your changes.

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="150%">

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Test your changes thoroughly on multiple devices
- Update documentation as needed
- Ensure responsive design works on all screen sizes

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

**Global Documentation**

- [Environment Setup](./ENVIRONMENT_SETUP.md) - Detailed environment configuration
- [GitHub API Setup](./GITHUB_API_SETUP.md) - GitHub integration guide
- [Cron Job Setup](./CRON_SETUP.md) - Automated data refresh setup
- [Monthly Winners Setup](./MONTHLY_WINNERS_SETUP.md) - Monthly winners system
- [Setup Guide](./SETUP.md) - Complete setup walkthrough

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

**Troubleshooting**

### Common Issues

1. **Missing GitHub data**: Ensure your `GITHUB_TOKEN` is set correctly
2. **Database connection errors**: Check your `DATABASE_URL` and NeonDB project status
3. **Authentication issues**: Verify your Clerk configuration
4. **Image upload failures**: Confirm your `IMGBB_API_KEY` is valid

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

### Getting Help

- Check the [documentation](./docs/) for detailed guides
- Search existing [issues](https://github.com/Anshkaran7/git-aura/issues)
- Create a new issue with detailed information about your problem

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

## 🙏 Acknowledgments

- Built with ❤️ using Next.js and TypeScript
- GitHub API for contribution data
- Clerk for authentication
- NeonDB for database hosting
- All contributors who help improve this project

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

**Contribution Guidelines**

We love our contributors! If you'd like to help, please check out our [`CONTRIBUTE.md`](https://github.com/Anshkaran7/git-aura/blob/main/CONTRIBUTING.md) file for guidelines.

> Thank you once again to all our contributors who has contributed to **git-aura!** Your efforts are truly appreciated. 💖👏

<!-- Contributors badge (auto-updating) -->

[![Contributors](https://img.shields.io/github/contributors/Anshkaran7/git-aura?style=for-the-badge)](https://github.com/Anshkaran7/git-aura/graphs/contributors)

<!-- Contributors avatars (auto-updating) -->
<p align="left">
  <a href="https://github.com/Anshkaran7/git-aura/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=Anshkaran7/git-aura" alt="Contributors" />
  </a>
</p>

See the full list of contributors and their contributions on the [`GitHub Contributors Graph`](https://github.com/Anshkaran7/git-aura/graphs/contributors).

<p style="font-family:var(--ff-philosopher);font-size:3rem;"><b> Show some <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Red%20Heart.png" alt="Red Heart" width="40" height="40" /> by starring this awesome repository!
</p>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="150%">

**Suggestions & Feedback**

Feel free to open issues or discussions if you have any feedback, feature suggestions, or want to collaborate!

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="150%">

**Support & Star**

**_If you find this project helpful, please give it a star! ⭐ to support more such educational initiatives!_**

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

**License**

This project is licensed under the MIT License - see the [`License`](https://github.com/Anshkaran7/git-aura/blob/main/License) file for details.

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="150%">

**⭐ Stargazers**

<div align="center">
  <a href="https://github.com/Anshkaran7/git-aura/stargazers">
    <img src="https://reporoster.com/stars/Anshkaran7/git-aura?type=svg&limit=100&names=false" alt="Stargazers" />
  </a>
</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="150%">

**Forkers**

<div align="center">
  <a href="https://github.com/Anshkaran7/git-aura/network/members">
    <img src="https://reporoster.com/forks/Anshkaran7/git-aura?type=svg&limit=100&names=false" alt="Forkers" />
  </a>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="150%">

<h2>Project Admin:</h2>
<table>
<tr>
<td align="center">
<a href="https://github.com/Anshkaran7"><img src="https://avatars.githubusercontent.com/u/106963118?v=4" height="140px" width="140px" alt="Karan Kumar"></a><br><sub><b>Karan Kumar</b><br><a href="https://www.linkedin.com/in/itsmeekaran/"><img src="https://github-production-user-asset-6210df.s3.amazonaws.com/73993775/278833250-adb040ea-e3ef-446e-bcd4-3e8d7d4c0176.png" width="45px" height="45px"></a></sub>
</td>
</tr>
</table>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="150%">

<h1 align="center"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Glowing%20Star.png" alt="Glowing Star" width="25" height="25" /> Give us a Star and let's make magic! <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Glowing%20Star.png" alt="Glowing Star" width="25" height="25" /></h1>

<p align="center">
     <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Mirror%20Ball.png" alt="Mirror Ball" width="150" height="150" />
</p>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="150%">

**👨‍💻 Developed By**
**❤️ Karan Kumar and Contributors ❤️** [open an issue](https://github.com/Anshkaran7/git-aura/issues) | [Watch Demo](https://git-aura.karandev.in/)

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="150%">

<div align="center">
    <a href="#top">
        <img src="https://img.shields.io/badge/Back%20to%20Top-000000?style=for-the-badge&logo=github&logoColor=white" alt="Back to Top">
    </a>
</div>

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=65&section=footer"/>

**Ready to show off your coding achievements?** Get started with Git~Aura today! 🚀
