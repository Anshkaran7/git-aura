import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  location: string | null;
  company: string | null;
  avatar_url: string;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  size: number;
}

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Fetch GitHub user data
    const userResponse = await fetch(`https://api.github.com/users/${username}`);
    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        return NextResponse.json({ error: 'GitHub user not found. Check the username and try again!' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 });
    }
    const userData: GitHubUser = await userResponse.json();

    // Fetch user's repositories
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=20`);
    if (!reposResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
    }
    const reposData: GitHubRepo[] = await reposResponse.json();

    // Create roast prompt
    const prompt = createRoastPrompt(userData, reposData);

    // Generate roast using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      {
        text: `You are a witty, sarcastic comedian who roasts developers based on their GitHub profiles. Be humorous but not mean-spirited or offensive. Keep it fun and clever, around 150-200 words. Use developer humor, coding references, and programming jokes. Don't be harsh or personal - keep it light and entertaining.\n\n${prompt}`
      }
    ]);

    const response = await result.response;
    const roast = response.text().trim();

    if (!roast) {
      return NextResponse.json({ 
        roast: "Your GitHub is so perfect, even our AI is speechless! Maybe try committing some bugs first? 😅" 
      });
    }

    return NextResponse.json({ roast });

  } catch (error) {
    console.error('Error generating roast:', error);
    
    // Handle specific Gemini API errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
      }
      if (error.message.includes('quota')) {
        return NextResponse.json({ error: 'Service temporarily unavailable. Please try again later!' }, { status: 429 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate roast. Please try again later!' },
      { status: 500 }
    );
  }
}

function createRoastPrompt(user: GitHubUser, repos: GitHubRepo[]): string {
  const accountAge = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365));
  
  // Analyze programming languages
  const languages = repos
    .filter(repo => repo.language)
    .reduce((acc, repo) => {
      acc[repo.language!] = (acc[repo.language!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topLanguages = Object.entries(languages)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([lang]) => lang);

  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  
  // Check for specific repo patterns
  const hasHelloWorldRepo = repos.some(repo => 
    repo.name.toLowerCase().includes('hello') || 
    repo.name.toLowerCase().includes('world') ||
    repo.name.toLowerCase().includes('test')
  );
  
  const hasPersonalWebsite = repos.some(repo => 
    repo.name.toLowerCase() === user.login.toLowerCase() ||
    repo.name.toLowerCase().includes('portfolio') ||
    repo.name.toLowerCase().includes('website')
  );

  const hasTodoApp = repos.some(repo =>
    repo.name.toLowerCase().includes('todo') ||
    repo.name.toLowerCase().includes('task')
  );

  const hasCalculatorApp = repos.some(repo =>
    repo.name.toLowerCase().includes('calculator') ||
    repo.name.toLowerCase().includes('calc')
  );

  // Analyze repo sizes and descriptions
  const reposWithoutDescription = repos.filter(repo => !repo.description || repo.description.trim() === '').length;
  const largestRepo = repos.reduce((max, repo) => repo.size > max.size ? repo : max, repos[0] || { size: 0 });

  // Recent activity
  const recentRepos = repos.filter(repo => {
    const lastUpdate = new Date(repo.updated_at);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return lastUpdate > thirtyDaysAgo;
  });

  return `Roast this GitHub developer based on their profile:

BASIC INFO:
- Username: ${user.login}
- Name: ${user.name || 'Too cool for a real name'}
- Bio: "${user.bio || 'No bio - mysterious developer energy'}"
- Location: ${user.location || 'Probably their basement'}
- Company: ${user.company || 'Unemployed or stealth startup'}
- Account Age: ${accountAge} years old
- Public Repos: ${user.public_repos}
- Followers: ${user.followers}
- Following: ${user.following}

REPOSITORY ANALYSIS:
- Top Programming Languages: ${topLanguages.join(', ') || 'Language agnostic (or confused)'}
- Total Stars Earned: ${totalStars}
- Total Forks: ${totalForks}
- Repos Without Description: ${reposWithoutDescription}/${repos.length}
- Recent Activity: ${recentRepos.length} repos updated in last 30 days
- Largest Repo Size: ${largestRepo?.size || 0} KB

TYPICAL DEVELOPER PATTERNS:
- Has Hello World/Test repo: ${hasHelloWorldRepo ? 'Yes (classic beginner move)' : 'No (too cool for tutorials)'}
- Has Personal Website/Portfolio: ${hasPersonalWebsite ? 'Yes (trying to look professional)' : 'No (probably using LinkedIn as portfolio)'}
- Has Todo App: ${hasTodoApp ? 'Yes (every developer\'s first "real" project)' : 'No'}
- Has Calculator App: ${hasCalculatorApp ? 'Yes (the other beginner classic)' : 'No'}

RECENT REPOSITORIES (Top 5):
${repos.slice(0, 5).map(repo => 
  `- "${repo.name}": ${repo.description || 'No description (professional as always)'} 
    [${repo.language || 'Unknown language'}, ${repo.stargazers_count} ⭐, ${repo.forks_count} 🍴]`
).join('\n')}

Create a funny, witty roast that references their coding patterns, repo naming, activity level, and developer stereotypes. Include programming jokes and references that developers would appreciate!`;
}
