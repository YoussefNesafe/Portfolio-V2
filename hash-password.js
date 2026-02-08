#!/usr/bin/env node

/**
 * Utility script to hash passwords for admin user creation
 * Usage: node hash-password.js
 * Then enter your password when prompted
 */

const { hashPassword } = require("./src/app/lib/auth");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  rl.question("Enter password to hash: ", async (password) => {
    try {
      if (!password || password.length < 6) {
        console.error("❌ Password must be at least 6 characters");
        process.exit(1);
      }

      const hash = await hashPassword(password);
      console.log("\n✅ Hashed password (copy and paste in Prisma Studio):\n");
      console.log(hash);
      console.log(
        "\n\nPaste this entire string into the 'password' field in Prisma Studio when creating the AdminUser.\n",
      );
    } catch (error) {
      console.error("❌ Error hashing password:", error.message);
      process.exit(1);
    }
    rl.close();
  });
}

main();
