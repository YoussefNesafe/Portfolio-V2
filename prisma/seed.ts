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

    // Create admin user (password from ADMIN_PASSWORD env var, fallback to "admin123")
    const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD ?? "admin123");
    const adminUser = await db.adminUser.upsert({
      where: { email: "ynessafe@gmail.com" },
      update: { password: hashedPassword },
      create: {
        email: "ynessafe@gmail.com",
        password: hashedPassword,
        name: "Admin User",
        role: "ADMIN",
      },
    });
    console.log(
      "✅ Admin user created - Email: ynessafe@gmail.com, Password: admin123",
    );

    // Create brag categories
    const bragCategories = [
      { name: "Projects", slug: "projects", color: "#06B6D4", sortOrder: 0 },
      { name: "Bug Fixes", slug: "bug-fixes", color: "#EF4444", sortOrder: 1 },
      { name: "Learning", slug: "learning", color: "#A855F7", sortOrder: 2 },
      {
        name: "Collaboration",
        slug: "collaboration",
        color: "#F59E0B",
        sortOrder: 3,
      },
      {
        name: "Design/Architecture",
        slug: "design-architecture",
        color: "#10B981",
        sortOrder: 4,
      },
      {
        name: "DevOps/Infra",
        slug: "devops-infra",
        color: "#3B82F6",
        sortOrder: 5,
      },
    ];
    await Promise.all(
      bragCategories.map((cat) =>
        db.bragCategory.upsert({
          where: { name: cat.name },
          update: {},
          create: cat,
        }),
      ),
    );
    console.log("✅ Brag categories created:", bragCategories.length);
    console.log("   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!");

    console.log("\n✨ Database seeding complete!\n");
    console.log("📝 Test credentials:");
    console.log("   Email: ynessafe@gmail.com");
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
