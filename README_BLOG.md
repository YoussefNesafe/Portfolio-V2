# Blog System - Setup & Testing Guide

## 🎯 Overview

Your portfolio now has a complete blog system built with:

- **Backend**: Next.js 16 App Router + Prisma ORM
- **Database**: PostgreSQL (cloud or local)
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Authentication**: Session-based with password hashing
- **Features**: Full CRUD, search, filtering, pagination

## ⚡ Quick Start (15 minutes)

### Step 1: Configure Database

Update `.env.local` with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
SESSION_SECRET="generate-a-32-char-secret-string"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

**Recommended database providers:**

- **Supabase** (easiest, free tier): https://supabase.com
- **Railway**: https://railway.app
- **Vercel Postgres**: https://vercel.com/postgres
- **Local PostgreSQL**: If you have it installed

### Step 2: Set Up Database

```bash
# Run migrations to create tables
npx prisma migrate dev --name init
```

### Step 3: Create Test Data

```bash
# Open Prisma Studio (built-in database UI)
npm run db:studio
```

Then use the web UI to create:

1. **Author** - Your name and email
2. **AdminUser** - For admin login (email/password)
3. **Post** - A sample blog post

**Need to hash a password first?**

```bash
node hash-password.js
```

### Step 4: Start Development Server

```bash
npm run dev
```

Visit:

- Blog: http://localhost:3000/blog
- Admin Login: http://localhost:3000/admin/login
- Admin Dashboard: http://localhost:3000/admin (after you proceed with Phase 5)

## 📚 Documentation

- **`TESTING_GUIDE.md`** - Detailed testing instructions with examples
- **`IMPLEMENTATION_SUMMARY.md`** - What's been built in Phases 1-4
- **`DATABASE_SETUP.md`** - Database configuration options
- **`DATABASE.md`** - Your original setup notes

## 🏗️ Architecture

### Public Routes

```
/blog                              - Blog listing (responsive grid)
/blog?search=...&category=...      - Filtered results
/blog/[slug]                       - Individual post (SEO optimized)
```

### Admin Routes (Protected)

```
/admin/login                       - Admin login page
/admin                             - Dashboard (Phase 5)
/admin/posts                       - Posts management (Phase 5)
/admin/categories                  - Categories management (Phase 5)
/admin/tags                        - Tags management (Phase 5)
```

### API Routes

```
GET    /api/blog                   - List posts (paginated)
POST   /api/blog                   - Create post (requires auth)
GET    /api/blog/[id]              - Get single post
PUT    /api/blog/[id]              - Update post (requires auth)
DELETE /api/blog/[id]              - Delete post (requires auth)
GET    /api/blog/search?q=...      - Search posts
GET    /api/blog/categories        - List categories
GET    /api/blog/tags              - List tags
POST   /api/auth/login             - Admin login
POST   /api/auth/logout            - Admin logout
GET    /api/auth/me                - Get current user
```

## 🗄️ Database Schema

### Post

- id, slug (unique), title, description, content, excerpt
- coverImage, published, publishedAt, createdAt, updatedAt
- authorId (FK to Author)
- relations: categories[], tags[]

### Category

- id, name (unique), slug (unique), description
- relations: posts[]

### Tag

- id, name (unique), slug (unique)
- relations: posts[]

### Author

- id, email (unique), name, avatar
- relations: posts[]

### AdminUser

- id, email (unique), password (hashed), name, role
- createdAt

## 🔑 Features

### Public Features ✅

- Blog listing with pagination (9 posts per page)
- Individual post pages with metadata
- Search posts by title/description
- Filter by category or tag
- Reading time calculation
- Responsive design
- SEO optimized (Open Graph, structured data)

### Admin Features (API Ready) ✅

- Create, read, update, delete posts
- Manage categories and tags
- Session-based authentication
- Password hashing and verification
- Role-based access (ADMIN, EDITOR roles available)

### Admin Features (Coming Phase 5) ⏳

- Admin dashboard with statistics
- Visual post editor with rich text
- Category/tag management UI
- Post publish/draft workflow
- Form validation

## 🧪 Testing

### Test Public Blog

```bash
# List posts
curl http://localhost:3000/api/blog

# Search
curl http://localhost:3000/api/blog/search?q=test

# View categories
curl http://localhost:3000/api/blog/categories
```

### Test Admin Login

```bash
# Login and get session
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}'

# Check current user
curl http://localhost:3000/api/auth/me \
  -H "Cookie: session=YOUR_SESSION_TOKEN"
```

### Test Post Creation

```bash
curl -X POST http://localhost:3000/api/blog \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_TOKEN" \
  -d '{
    "title": "Test Post",
    "description": "A test post",
    "content": "<p>Content here</p>"
  }'
```

## ⚙️ Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:studio   # Open Prisma Studio (database UI)
npm run db:seed     # Seed with sample data (if ts-node installed)
node hash-password.js # Generate password hashes
```

## 🔒 Security Notes

- Passwords hashed with PBKDF2 (100,000 iterations)
- Session tokens are 32-byte random hex strings
- Cookies are HTTP-only (can't access via JavaScript)
- Cookies are secure (only sent over HTTPS in production)
- Middleware protects all `/admin` routes
- API routes validate session tokens

## 🚀 What's Ready

✅ Full database with migrations
✅ Complete REST API with validation
✅ Session-based authentication
✅ Public blog pages
✅ Admin login endpoint
✅ Search and filtering
✅ Pagination
✅ Responsive design
✅ SEO optimization
✅ TypeScript throughout
✅ Zero type errors

## ⏭️ Next Phases

### Phase 5: Admin Dashboard

- Dashboard page with statistics
- Posts management listing
- Rich text editor (TipTap)
- Category/tag management pages
- Post form with validation

### Phase 6: Admin Login UI & Polish

- Login form styling
- Error messages and feedback
- Redirect flows

### Phase 7: Integration & Final

- Blog link in main portfolio nav
- Blog sitemap
- Deployment checklist

## 💡 Tips

1. **Use Prisma Studio** for easy database management:

   ```bash
   npm run db:studio
   ```

2. **Hash passwords** before creating admin users:

   ```bash
   node hash-password.js
   ```

3. **Debug** database issues:

   ```bash
   npx prisma db push              # Push schema without migration
   npx prisma db pull              # Pull schema from database
   npx prisma generate             # Regenerate client
   ```

4. **View logs** - Check `.next/logs` and browser console

5. **Reset database** (development only):
   ```bash
   npx prisma migrate reset        # WARNING: Deletes all data!
   ```

## 🆘 Troubleshooting

### Database won't connect

- [ ] Check `DATABASE_URL` in `.env.local`
- [ ] Ensure database server is running
- [ ] Verify connection string format
- [ ] Check IP whitelisting in database provider

### Prisma Studio won't open

```bash
lsof -i :5555          # Find process on port 5555
kill -9 <PID>          # Kill it
npm run db:studio      # Try again
```

### Next.js won't start

```bash
rm -rf .next           # Delete cache
npm run dev            # Try again
```

### Can't login

- Verify AdminUser exists in Prisma Studio
- Check password hash format (should be `salt:hash`)
- Generate new hash: `node hash-password.js`

## 📖 Learn More

- [Next.js 16 Documentation](https://nextjs.org)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)

## ✨ Ready?

1. Update `.env.local` with your database URL
2. Run `npx prisma migrate dev --name init`
3. Run `npm run db:studio` to create test data
4. Run `npm run dev` to start the server
5. Visit http://localhost:3000/blog

**All set! Once tested, let me know and we'll continue with Phase 5 (Admin Dashboard).**
