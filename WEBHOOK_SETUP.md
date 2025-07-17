# Clerk Webhook Setup Guide

This guide explains how to set up Clerk webhooks to automatically sync user data to Supabase when users sign up, update their profiles, or delete their accounts.

## Required Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Step 1: Get Supabase Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Service Role Key** (not the anon key)
4. Add it to your environment variables as `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Important**: The service role key bypasses Row Level Security and should only be used in server-side code. Never expose it to the client.

## Step 2: Configure Clerk Webhook

### For Development (using ngrok or similar)

1. Install ngrok: `npm install -g ngrok`
2. Start your Next.js app: `npm run dev`
3. In another terminal, expose your local server: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### For Production

Use your deployed app URL (e.g., `https://your-app.vercel.app`)

### Create the Webhook in Clerk

1. Go to the [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to **Webhooks** in the sidebar
4. Click **Add Endpoint**
5. Set the endpoint URL to:
   - Development: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - Production: `https://your-domain.com/api/webhooks/clerk`
6. Select these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
7. Click **Create**
8. Copy the **Signing Secret** and add it to your environment variables as `CLERK_WEBHOOK_SECRET`

## Step 3: Test the Webhook

### Manual Testing

1. Sign up a new user in your app
2. Check your app logs to see if the webhook was received
3. Verify the user was created in your Supabase `users` table
4. Update the user's profile in Clerk and verify the changes sync to Supabase

### Using Clerk's Webhook Testing

1. In the Clerk Dashboard, go to your webhook endpoint
2. Click **Send Test Event**
3. Choose `user.created` and send the test
4. Check your app logs and Supabase to confirm it worked

## How It Works

### Webhook Events Handled

- **`user.created`**: When a user signs up, their basic info (name, email, avatar) is automatically added to Supabase
- **`user.updated`**: When a user updates their profile, the changes sync to Supabase
- **`user.deleted`**: When a user account is deleted, the record is removed from Supabase (cascade deletes related data)

### Automatic Sync for Existing Users

The app also includes a `UserSync` component that runs on every page load to ensure authenticated users exist in Supabase, even if they signed up before webhooks were configured.

### Data Synced

The following user data is synced to Supabase:

```typescript
{
  id: string; // Clerk user ID (primary key)
  email: string; // Primary email address
  display_name: string; // First name + Last name, or username, or email prefix
  avatar_url: string; // Profile image URL
  created_at: string; // Account creation timestamp
  updated_at: string; // Last update timestamp
}
```

## Troubleshooting

### Webhook Not Receiving Events

1. Check that your webhook URL is accessible publicly
2. Verify the endpoint URL in Clerk matches your deployed app
3. Check the webhook signing secret is correct
4. Look for errors in your app logs

### Users Not Syncing

1. Verify the `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. Check your Supabase table permissions
3. Ensure the `users` table exists with the correct schema
4. Look for error logs in your app console

### Development Issues

1. Make sure ngrok is running and the URL is current
2. Update the webhook URL in Clerk if ngrok URL changed
3. Restart your development server after adding environment variables

## Security Considerations

1. **Never expose the service role key** to the client
2. **Always verify webhook signatures** (handled automatically by the svix library)
3. **Use HTTPS** for webhook endpoints in production
4. **Rotate secrets** periodically for enhanced security

## Database Schema

Ensure your Supabase `users` table has this schema:

```sql
create table if not exists public.users (
  id uuid primary key,                    -- Clerk user ID
  email text unique not null,
  github_username text unique,
  github_id text unique,
  display_name text,
  avatar_url text,
  github_data jsonb,
  total_aura integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_contribution_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

The webhook will populate the basic user fields, and your GitHub sync functionality can update the GitHub-specific fields later.
