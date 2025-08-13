import { NextRequest, NextResponse } from 'next/server';

import { fetchGitHubProfile } from '../../../lib/github-fetch';
import { compareProfiles } from '../../../lib/aura-calculations';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user1 = searchParams.get('user1');
  const user2 = searchParams.get('user2');
  if (!user1 || !user2) {
    return NextResponse.json({ error: 'Missing usernames' }, { status: 400 });
  }
  try {
    const [res1, res2] = await Promise.all([
      fetchGitHubProfile(user1),
      fetchGitHubProfile(user2),
    ]);
    if (!res1.success || !res1.data || !res2.success || !res2.data) {
      return NextResponse.json({ error: 'Failed to fetch one or both profiles' }, { status: 404 });
    }
    const result = compareProfiles(res1.data, res2.data);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
  }
}
