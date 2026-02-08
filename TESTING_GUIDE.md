# Testing Blog Setup - Quick Start Guide

## 1. Configure Environment Variables

Update `.env.local` with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
SESSION_SECRET="your-32-characters-or-longer-secret-string"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## 2. Run Database Migrations

After updating `.env.local`:

```bash
npx prisma migrate dev --name init
```

This will:

- Connect to your database
- Create all tables (Post, Category, Tag, Author, AdminUser)
- Generate Prisma client

## 3. Create Initial Data (Easiest Method)

### Using Prisma Studio:

```bash
npm run db:studio
```

This opens a web UI at http://localhost:5555

#### Step 1: Create an Author

- Click on "Author" table
- Click "Add record"
- Fill in:
  - `email`: your-email@example.com
  - `name`: Your Name
  - `avatar`: (leave blank)
- Save

#### Step 2: Create an AdminUser for Login

First, generate a hashed password:

```bash
node hash-password.js
```

Then in Prisma Studio:

- Click on "AdminUser" table
- Click "Add record"
- Fill in:
  - `email`: admin@example.com
  - `password`: (paste the hashed password from above)
  - `name`: Admin User
  - `role`: ADMIN
- Save

#### Step 3: Create a Test Post

- Click on "Post" table
- Click "Add record"
- Fill in:
  - `title`: "Welcome to My Blog"
  - `slug`: "welcome-to-my-blog"
  - `description`: "This is my first test post"
  - `content`: `<h2>Hello World!</h2><p>This is my first blog post.</p>`
  - `excerpt`: "This is my first test post"
  - `coverImage`: (leave blank)
  - `published`: true (toggle the checkbox)
  - `publishedAt`: (click calendar, select today)
  - `authorId`: (click dropdown, select the author you created)
- Save

#### Exit Prisma Studio

Press `Ctrl+C` in terminal

## 4. Run Dev Server

```bash
npm run dev
```

Visit: http://localhost:3000

## 5. Test the Blog

### Public Blog Pages:

- **Blog listing**: http://localhost:3000/blog
  - Should display your test post
  - Responsive grid
  - Pagination

- **Individual post**: http://localhost:3000/blog/welcome-to-my-blog
  - Full post content
  - Reading time
  - Back link to blog

### Admin Routes:

- **Login page**: http://localhost:3000/admin/login
  - Email: admin@example.com
  - Password: (the one you hashed)

## 6. Test API Endpoints

### Get all published posts:

```bash
curl http://localhost:3000/api/blog
```

### Search posts:

```bash
curl http://localhost:3000/api/blog/search?q=welcome
```

### Get all categories:

```bash
curl http://localhost:3000/api/blog/categories
```

### Login (to get session cookie):

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}'
```

### Create a post (requires login):

```bash
curl -X POST http://localhost:3000/api/blog \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_TOKEN" \
  -d '{
    "title": "My Second Post",
    "description": "Testing post creation",
    "content": "<p>Test content</p>"
  }'
```

## Common Issues & Solutions

### "Error: connect ECONNREFUSED"

- Check DATABASE_URL in `.env.local`
- Ensure database server is running
- Verify connection string format

### Prisma Studio won't open

```bash
# Kill process on port 5555
lsof -i :5555
kill -9 <PID>
npm run db:studio
```

### Migration fails

```bash
# Ensure environment is loaded
cat .env.local
# Try again
npx prisma migrate dev --name init
```

### Next.js won't start

```bash
rm -rf .next
npm run dev
```

## Verification Checklist

- [ ] Database connected (migrations successful)
- [ ] Author created
- [ ] AdminUser created with hashed password
- [ ] Post created and published
- [ ] /blog shows the post
- [ ] /blog/welcome-to-my-blog loads correctly
- [ ] /admin/login loads
- [ ] Can login with admin credentials
- [ ] API endpoints return data

## Next Steps

Once verified:

1. Create more test posts
2. Test search/filters
3. Proceed with Phase 5 (Admin Dashboard)
