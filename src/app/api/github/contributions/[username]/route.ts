import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params;

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 }
    );
  }

  // Check if GitHub token is available
  if (!process.env.GITHUB_TOKEN) {
    console.warn('GitHub token not found in environment variables');
    return NextResponse.json(
      { error: 'GitHub token not configured. Please set GITHUB_TOKEN environment variable.' },
      { status: 500 }
    );
  }

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    'User-Agent': 'GitAura-App',
  };

  try {
    // Calculate date range (last year)
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);
    lastYear.setDate(lastYear.getDate() + 1);

    const graphqlQuery = {
      query: `query($userName:String!) { 
        user(login: $userName){
          contributionsCollection(from: "${lastYear.toISOString()}", to: "${today.toISOString()}") {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }`,
      variables: { userName: username },
    };

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('GitHub GraphQL API Error:', errorData);
      
      // Handle rate limiting specifically
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'GitHub API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch contributions' },
        { status: response.status }
      );
    }

    const contributionsData = await response.json();

    if (contributionsData.errors) {
      console.error('GitHub GraphQL Errors:', contributionsData.errors);
      return NextResponse.json(
        { error: contributionsData.errors[0].message },
        { status: 400 }
      );
    }

    if (!contributionsData.data?.user?.contributionsCollection) {
      return NextResponse.json(
        { 
          error: 'No contributions data found. This might be due to API rate limits or missing GitHub token.' 
        },
        { status: 404 }
      );
    }

    const calendar = contributionsData.data.user.contributionsCollection.contributionCalendar;
    
    const allContributions = calendar.weeks.flatMap(
      (week: { contributionDays: any[] }) => week.contributionDays
    );

    const result = {
      totalContributions: calendar.totalContributions,
      contributionDays: allContributions,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
} 