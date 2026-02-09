import { db } from "../src/app/lib/db";
import { hashPassword } from "../src/app/lib/auth";

async function main() {
  console.log("🌱 Seeding database...");

  try {
    // Create an author
    const author = await db.author.upsert({
      where: { email: "ynessafe@gmail.com" },
      update: {},
      create: {
        email: "ynessafe@gmail.com",
        name: "Youssef Nesafe",
        avatar: null,
      },
    });
    console.log("✅ Author created:", author.name);

    // Create categories
    const categories = await Promise.all([
      db.category.upsert({
        where: { name: "Technology" },
        update: {},
        create: {
          name: "Technology",
          slug: "technology",
          description: "Technology and programming posts",
        },
      }),
      db.category.upsert({
        where: { name: "Web Development" },
        update: {},
        create: {
          name: "Web Development",
          slug: "web-development",
          description: "Web development tutorials and articles",
        },
      }),
    ]);
    console.log("✅ Categories created:", categories.length);

    // Create tags
    const tags = await Promise.all([
      db.tag.upsert({
        where: { name: "NextJS" },
        update: {},
        create: {
          name: "NextJS",
          slug: "nextjs",
        },
      }),
      db.tag.upsert({
        where: { name: "React" },
        update: {},
        create: {
          name: "React",
          slug: "react",
        },
      }),
      db.tag.upsert({
        where: { name: "TypeScript" },
        update: {},
        create: {
          name: "TypeScript",
          slug: "typescript",
        },
      }),
      db.tag.upsert({
        where: { name: "Prisma" },
        update: {},
        create: {
          name: "Prisma",
          slug: "prisma",
        },
      }),
    ]);
    console.log("✅ Tags created:", tags.length);

    // Create admin user (with default password "admin123")
    const hashedPassword = await hashPassword("admin123");
    const adminUser = await db.adminUser.upsert({
      where: { email: "admin@example.com" },
      update: { password: hashedPassword },
      create: {
        email: "admin@example.com",
        password: hashedPassword,
        name: "Admin User",
        role: "ADMIN",
      },
    });
    console.log(
      "✅ Admin user created - Email: admin@example.com, Password: admin123",
    );
    console.log("   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!");

    // Create a sample blog post
    const post = await db.post.upsert({
      where: { slug: "welcome-to-my-blog" },
      update: {},
      create: {
        slug: "welcome-to-my-blog",
        title: "Welcome to My Blog",
        description: "This is a sample post to test your blog setup",
        content: `
          <h2>Welcome!</h2>
          <p>This is a sample blog post created during seeding. You can edit or delete it in the admin panel.</p>

          <h3>Features Included:</h3>
          <ul>
            <li>Full blog system with database</li>
            <li>Admin dashboard for managing posts</li>
            <li>Search and filtering by category/tags</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>SEO optimized with dynamic metadata</li>
          </ul>

          <h3>Next Steps:</h3>
          <p>Login to the admin panel at <code>/admin</code> with:</p>
          <ul>
            <li>Email: admin@example.com</li>
            <li>Password: admin123</li>
          </ul>

          <p>Then you can create, edit, and publish your own blog posts!</p>
        `,
        excerpt: "This is a sample post to test your blog setup",
        coverImage: null,
        published: true,
        publishedAt: new Date(),
        authorId: author.id,
        categories: {
          connect: [{ id: categories[0].id }],
        },
        tags: {
          connect: [{ id: tags[0].id }, { id: tags[1].id }, { id: tags[2].id }],
        },
      },
    });
    console.log("✅ Sample post created:", post.title);

    console.log("\n✨ Database seeding complete!\n");
    console.log("📝 Test credentials:");
    console.log("   Email: admin@example.com");
    console.log("   Password: admin123");
    console.log("\n🔗 Visit http://localhost:3000/blog to see the sample post");
    console.log("🔗 Visit http://localhost:3000/admin/login to login\n");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
