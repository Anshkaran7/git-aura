# Environment Variables Setup

This document explains the environment variables required for the secure API wrapper implementation.

## Required Environment Variables

### Database

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Note:** The service role key is needed for admin operations like updating leaderboards.

### GitHub API (Server-side only - SECURE)

```
GITHUB_TOKEN=your_github_personal_access_token
```

**Important**: This replaces the old `NEXT_PUBLIC_GITHUB_TOKEN` which was exposed to the client. The new `GITHUB_TOKEN` is kept secure on the server.

### Image Upload (Server-side only - SECURE)

```
IMGBB_API_KEY=your_imgbb_api_key
```

**Important**: This replaces the old `NEXT_PUBLIC_IMGBB_API_KEY` which was exposed to the client. The new `IMGBB_API_KEY` is kept secure on the server.

### Clerk Authentication

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Migration Notes

### Before (Insecure - API keys exposed to client)

- `NEXT_PUBLIC_GITHUB_TOKEN` - ❌ Exposed to client
- `NEXT_PUBLIC_IMGBB_API_KEY` - ❌ Exposed to client

### After (Secure - API keys kept on server)

- `GITHUB_TOKEN` - ✅ Server-side only
- `IMGBB_API_KEY` - ✅ Server-side only

## API Endpoints Created

1. **GET `/api/github/profile/[username]`** - **[OPTIMIZED]** Fetches GitHub data + background aura saving
2. **GET `/api/github/user/[username]`** - Fetches GitHub user profiles (legacy)
3. **GET `/api/github/contributions/[username]`** - Fetches GitHub contributions (legacy)
4. **POST `/api/save-monthly-aura`** - Manual monthly aura saving (legacy - now automatic)
5. **POST `/api/upload-image`** - Handles image uploads to ImgBB
6. **GET `/api/github/test-token`** - Tests GitHub token validity and shows rate limits

## Performance Optimizations

- **Single API Call**: Combined profile + contributions endpoint reduces frontend calls from 3 to 1
- **Parallel Processing**: Server fetches profile and contributions simultaneously using `Promise.all()`
- **Background Aura Saving**: Monthly aura calculation and leaderboard updates happen automatically in background (non-blocking)
- **Eliminated Duplicate Calls**: Removed separate `/api/save-monthly-aura` calls from AuraPanel component
- **Better Error Handling**: Unified error responses and rate limit detection

## Security Benefits

- API keys are no longer exposed in the client-side bundle
- All external API calls are made from the server
- Rate limiting and caching can be implemented at the API level
- Better error handling and logging capabilities
