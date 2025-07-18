import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateTotalAura } from '../../../../../lib/aura';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Same calculation logic as save-monthly-aura API
const calculateMonthlyAura = (
  monthlyContributions: number,
  activeDays: number,
  daysInMonth: number
): number => {
  return Math.round(
    monthlyContributions * 10 + // 10 points per contribution
    activeDays * 50 + // 50 points per active day
    (activeDays / daysInMonth) * 1000 // Consistency bonus (up to 1000 points)
  );
};

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
    // Fetch user profile and contributions in parallel
    const [profileResponse, contributionsResponse] = await Promise.all([
      // Fetch user profile
      fetch(`https://api.github.com/users/${username}`, { headers }),
      
      // Fetch contributions using GraphQL
      (async () => {
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

        return fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers,
          body: JSON.stringify(graphqlQuery),
        });
      })()
    ]);

    // Handle profile response
    if (!profileResponse.ok) {
      const errorData = await profileResponse.json();
      console.error('GitHub API Error:', errorData);
      
      if (profileResponse.status === 403 && errorData.message?.includes('rate limit')) {
        return NextResponse.json(
          { error: 'GitHub API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: errorData.message || 'User not found' },
        { status: profileResponse.status }
      );
    }

    // Handle contributions response
    if (!contributionsResponse.ok) {
      const errorData = await contributionsResponse.json().catch(() => ({}));
      console.error('GitHub GraphQL API Error:', errorData);
      
      if (contributionsResponse.status === 403) {
        return NextResponse.json(
          { error: 'GitHub API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch contributions' },
        { status: contributionsResponse.status }
      );
    }

    // Parse responses
    const profileData = await profileResponse.json();
    const contributionsData = await contributionsResponse.json();

    // Handle GraphQL errors
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

    // Process contributions data
    const calendar = contributionsData.data.user.contributionsCollection.contributionCalendar;
    const allContributions = calendar.weeks.flatMap(
      (week: { contributionDays: any[] }) => week.contributionDays
    );

    const contributionsResult = {
      totalContributions: calendar.totalContributions,
      contributionDays: allContributions,
    };

    // Return combined data
    const response = NextResponse.json({
      profile: profileData,
      contributions: contributionsResult,
    });

    // If user is authenticated, save monthly aura in background (don't await)
    const userId = request.nextUrl.searchParams.get('userId');
    if (userId) {
      console.log(`✅ Starting background aura save for user: ${userId}`);
      saveMonthlyAuraInBackground(userId, contributionsResult.contributionDays).catch(err => {
        console.error('Background monthly aura save failed:', err);
      });
    } else {
      console.log('⚠️ No userId provided - skipping background aura save');
    }

    return response;

  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data' },
      { status: 500 }
    );
  }
}

// Background function to save monthly aura (non-blocking)
async function saveMonthlyAuraInBackground(userId: string, contributionDays: any[]) {
  try {
    // Get current month/year
    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Calculate current month contributions
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const currentMonthContributions = contributionDays.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= currentMonthStart && dayDate <= currentMonthEnd;
    });

    const monthlyContributionsCount = currentMonthContributions.reduce(
      (sum, day) => sum + day.contributionCount, 0
    );
    
    const activeDays = currentMonthContributions.filter(day => day.contributionCount > 0).length;
    const daysInMonth = currentMonthEnd.getDate();

    // Calculate monthly aura
    const monthlyAura = calculateMonthlyAura(monthlyContributionsCount, activeDays, daysInMonth);
    
    // Calculate total aura
    const totalAura = calculateTotalAura(contributionDays);

    // Update monthly leaderboard
    await supabaseAdmin
      .from('monthly_leaderboards')
      .upsert({
        user_id: userId,
        month_year: monthYear,
        total_aura: monthlyAura,
        contributions_count: monthlyContributionsCount,
        rank: 0 // Will be updated later
      }, {
        onConflict: 'user_id,month_year'
      });
    console.log('Monthly leaderboard updated:', monthlyAura);
    // Update global leaderboard
    await supabaseAdmin
      .from('global_leaderboard')
      .upsert({
        user_id: userId,
        total_aura: totalAura,
        rank: 0 // Will be updated later
      }, {
        onConflict: 'user_id'
      });

    console.log(`✅ Background aura save completed for user ${userId}: Monthly=${monthlyAura}, Total=${totalAura}`);
  } catch (error) {
    console.error('Error in background monthly aura save:', error);
    // Don't throw - this is background processing
  }
} 