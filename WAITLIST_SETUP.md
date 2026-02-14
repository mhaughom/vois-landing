# Waitlist Setup Guide

This guide will help you set up the waitlist system with Supabase integration and PostHog tracking.

## 1. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## 2. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project
4. Wait for the database to be set up

## 3. Create the Waitlist Table

Once your project is ready, go to the SQL Editor and run this SQL:

```sql
-- Create waitlist table
CREATE TABLE waitlist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  referral_source text,
  use_cases text[],
  preferred_device text,
  posthog_distinct_id text,
  completed_demo boolean DEFAULT false,
  watched_video boolean DEFAULT false,
  metadata jsonb,
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at DESC);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for signups)
CREATE POLICY "Allow public inserts" ON waitlist
  FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated reads (for you to view data)
CREATE POLICY "Allow authenticated reads" ON waitlist
  FOR SELECT TO authenticated USING (true);
```

## 4. Get Your Supabase Credentials

1. Go to Project Settings > API
2. Copy your **Project URL**
3. Copy your **anon/public** key

## 5. Add Environment Variables

Update your `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 6. Test It

1. Run `npm run dev`
2. Click "Join Waitlist"
3. Enter an email
4. Check Supabase Table Editor

## PostHog Tracking

All signups are automatically tracked with these events:
- `waitlist_modal_opened` - Source tracking
- `waitlist_email_entered`
- `waitlist_signup` - Full user identification

User properties:
- `email`, `joined_waitlist`, `referral_source`, `use_cases`, `preferred_device`, `completed_demo`, `watched_video`

## Export Data

In Supabase Table Editor: ... menu > Export to CSV

Or query:
```sql
SELECT * FROM waitlist ORDER BY created_at DESC;
```
