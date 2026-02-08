# TESTING INSTRUCTIONS - DO THIS NOW

## Your Next Steps (Choose based on your database provider)

### 🔴 STEP 1: Get Your Database URL

Choose ONE database provider and follow the setup:

#### Option A: Supabase (Easiest - Recommended)

1. Go to https://supabase.com
2. Click "Sign up" → Create account
3. Create new project (choose region closest to you)
4. Wait 2 minutes for setup
5. Click "Project Settings" (icon at bottom left)
6. Click "Database" tab
7. Under "Connection string", find "PostgreSQL"
8. Click copy icon → Copy the entire string
9. It looks like: `postgresql://postgres.xxxxx:PASSWORD@db.xxxxx.supabase.co:5432/postgres?schema=public`

#### Option B: Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. New project → Add PostgreSQL
4. Wait for deployment
5. Click database in project tree
6. Copy connection string from right sidebar

#### Option C: Vercel Postgres

1. Go to Vercel dashboard
2. Select your project
3. Storage tab → Create Postgres
4. Copy connection string

---

### 🟢 STEP 2: Update Your Environment File

1. Open `.env.local` in your editor
2. Find the line: `DATABASE_URL="postgresql://..."`
3. Replace it with your connection string from Step 1
4. Keep `SESSION_SECRET` as is
5. Save the file

**Example .env.local:**

```env
DATABASE_URL="postgresql://postgres.xxxxx:mypassword@db.xxxxx.supabase.co:5432/postgres?schema=public"
SESSION_SECRET="your-super-secret-string-at-least-32-chars-long"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

### 🟡 STEP 3: Create Database Tables

Open terminal in your project and run:

```bash
npx prisma migrate dev --name init
```

**What this does:**

- Connects to your database
- Creates all tables (Post, Category, Tag, Author, AdminUser)
- Generates Prisma client

**You should see:**

```
✓ Created migration
✓ Applied migration
✓ Generated Prisma Client
```

If you get errors, check:

- [ ] `.env.local` DATABASE_URL is correct
- [ ] Database server is running
- [ ] You can access the database from your internet connection

---

### 🔵 STEP 4: Create Test Data

Open Prisma Studio (visual database editor):

```bash
npm run db:studio
```

A web browser will open to `http://localhost:5555`

**Create in this order:**

#### 1. Author First

- Click "Author" table on left
- Click "+ Add record" button
- Fill in:
  - email: `your-email@example.com`
  - name: `Your Name`
  - avatar: (leave empty)
- Click "Save"

#### 2. Generate a Password Hash

In another terminal (keep Prisma Studio open):

```bash
node hash-password.js
```

Enter a password (e.g., `admin123`) and copy the hash it gives you.

#### 3. Create AdminUser in Prisma Studio

- Click "AdminUser" table
- Click "+ Add record"
- Fill in:
  - email: `admin@example.com`
  - password: (paste the hash from above)
  - name: `Admin User`
  - role: `ADMIN`
- Click "Save"

#### 4. Create a Test Post

- Click "Post" table
- Click "+ Add record"
- Fill in:
  - title: `Welcome to My Blog`
  - slug: `welcome-to-my-blog`
  - description: `This is my first test post`
  - content: `<h2>Hello!</h2><p>This is my first blog post.</p>`
  - excerpt: `This is my first test post`
  - coverImage: (leave empty)
  - published: toggle to **ON** (blue toggle)
  - publishedAt: click calendar icon → select today
  - authorId: click dropdown → select "Your Name"
- Click "Save"

**Exit**: Press Ctrl+C in the terminal to close Prisma Studio

---

### 🟢 STEP 5: Start Development Server

```bash
npm run dev
```

You should see:

```
  ▲ Next.js 16.1.6
  - Local:        http://localhost:3000
```

---

### 🔵 STEP 6: Test It!

Open your browser and visit these URLs:

**1. Blog Listing:**

- URL: http://localhost:3000/blog
- You should see your "Welcome to My Blog" post in a grid

**2. Individual Post:**

- URL: http://localhost:3000/blog/welcome-to-my-blog
- You should see the full post with "Hello!" heading and content

**3. Admin Login:**

- URL: http://localhost:3000/admin/login
- You should see a login form
- Email: `admin@example.com`
- Password: (whatever you set above)
- **Note**: Full admin features come in Phase 5

---

### ✅ Verification Checklist

Run through these to confirm everything works:

- [ ] Database URL updated in `.env.local`
- [ ] Prisma migrations ran successfully
- [ ] Author created in database
- [ ] AdminUser created with hashed password
- [ ] Blog post created and published
- [ ] `/blog` page shows the test post
- [ ] `/blog/welcome-to-my-blog` displays full post
- [ ] `/admin/login` page loads
- [ ] Dev server running without errors

---

## 🎉 Success!

If all checks pass, you have a **fully functional blog backend** ready to go!

Once you verify everything works, **let me know and we'll move to Phase 5** where we build the admin dashboard with the visual post editor.

---

## ❓ Common Issues

### "Error: connect ECONNREFUSED"

- Check DATABASE_URL in `.env.local` is copied correctly
- Verify database provider is running
- Check your internet connection

### "No such file or directory: .env.local"

- Create it: Copy the contents of `DATABASE_SETUP.md` into a `.env.local` file
- Update DATABASE_URL with your connection string

### Prisma Studio won't open

```bash
# Close it first
# Press Ctrl+C in the terminal

# Kill any lingering process
lsof -i :5555
kill -9 <PID>

# Try again
npm run db:studio
```

### Next.js errors on startup

```bash
# Delete cache
rm -rf .next

# Start again
npm run dev
```

---

**Ready? Follow these 6 steps above and report back when you're done! 🚀**
