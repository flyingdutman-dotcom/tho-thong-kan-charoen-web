#!/usr/bin/env node

/**
 * Script to promote a user to admin role
 * Usage: node scripts/promote-admin.mjs <email>
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DATABASE_URL?.split("@")[1]?.split("/")[0],
  user: process.env.DATABASE_URL?.split("://")[1]?.split(":")[0],
  password: process.env.DATABASE_URL?.split(":")[1]?.split("@")[0],
  database: process.env.DATABASE_URL?.split("/").pop(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function promoteUserToAdmin(email) {
  try {
    const connection = await pool.getConnection();

    // Find user by email
    const [users] = await connection.execute(
      "SELECT id, openId, name, email, role FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      console.error(`❌ ไม่พบผู้ใช้ที่มีอีเมล: ${email}`);
      connection.release();
      return;
    }

    const user = users[0];

    if (user.role === "admin") {
      console.log(`ℹ️  ผู้ใช้ ${email} เป็นแอดมินแล้ว`);
      connection.release();
      return;
    }

    // Update role to admin
    await connection.execute("UPDATE users SET role = ? WHERE id = ?", ["admin", user.id]);

    console.log(`✅ ยกระดับสำเร็จ!`);
    console.log(`   ชื่อ: ${user.name}`);
    console.log(`   อีเมล: ${user.email}`);
    console.log(`   OpenID: ${user.openId}`);
    console.log(`   บทบาทใหม่: admin`);

    connection.release();
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error.message);
  } finally {
    await pool.end();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log("📖 วิธีใช้: node scripts/promote-admin.mjs <email>");
  console.log("   ตัวอย่าง: node scripts/promote-admin.mjs admin@example.com");
  process.exit(1);
}

console.log(`🔄 กำลังยกระดับ ${email} เป็นแอดมิน...`);
promoteUserToAdmin(email);
