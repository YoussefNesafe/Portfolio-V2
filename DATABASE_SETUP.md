# Database Setup Instructions

## Required: Configure Your PostgreSQL Database

Before running migrations, you need to set up a cloud PostgreSQL database. Choose one:

### Option 1: Supabase (Recommended - Free tier available)

1. Go to https://supabase.com
2. Create a new project
3. Copy the connection string from Project Settings > Database > Connection String
4. Update `.env.local` with your DATABASE_URL

### Option 2: Railway

1. Go to https://railway.app
2. Create a new PostgreSQL database
3. Copy the connection string
4. Update `.env.local`

### Option 3: Vercel Postgres

1. Go to https://vercel.com/docs/storage/vercel-postgres
2. Set up Vercel Postgres in your project
3. Update `.env.local`

## After Setting Up Database

1. Update `DATABASE_URL` in `.env.local` with your actual connection string
2. Run migration: `npx prisma migrate dev --name init`
3. (Optional) Seed initial data: `npx prisma db seed`

## Verify Setup

- Prisma client has been generated ✓
- Schema is valid ✓
- Database credentials needed from you

Once you have your DATABASE_URL configured, we can proceed with running migrations and testing the database connection.
