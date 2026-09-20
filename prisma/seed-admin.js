require("dotenv").config();
const { PrismaClient } = require("../app/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const crypto = require("crypto");

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const email = "owner@navvyata.com";
  const password = "admin123";
  const hashedPassword = hashPassword(password);

  console.log("Seeding default Admin Owner into Supabase PostgreSQL...");

  try {
    // Check if user already exists
    const existing = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existing) {
      console.log("Admin user already exists! Updating credentials...");
      await prisma.adminUser.update({
        where: { email },
        data: {
          password: hashedPassword,
          name: "Store Owner",
          role: "Owner",
        },
      });
    } else {
      await prisma.adminUser.create({
        data: {
          email,
          password: hashedPassword,
          name: "Store Owner",
          role: "Owner",
        },
      });
      console.log("Default Admin Owner created successfully!");
    }
  } catch (err) {
    console.error("Failed to seed admin:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
