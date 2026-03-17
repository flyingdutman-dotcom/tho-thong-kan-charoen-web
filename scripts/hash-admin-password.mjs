import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';

const SALT_ROUNDS = 10;
const plainPassword = 'Passw0rd';

async function hashAndUpdate() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    console.log('Generated hash:', hashedPassword);

    // Parse DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not set');
    }

    // Create connection using DATABASE_URL
    const connection = await mysql.createConnection(dbUrl);

    // Update the admin user password
    const [result] = await connection.execute(
      'UPDATE admin_users SET password = ? WHERE username = ?',
      [hashedPassword, 'admin']
    );

    console.log('✓ Updated admin user password. Rows affected:', result.affectedRows);

    // Verify the update
    const [rows] = await connection.execute(
      'SELECT id, username FROM admin_users WHERE username = ?',
      ['admin']
    );

    if (rows.length > 0) {
      console.log('✓ Admin user verified:');
      console.log('  - ID:', rows[0].id);
      console.log('  - Username:', rows[0].username);
    }

    await connection.end();
    console.log('✓ Password update complete!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

hashAndUpdate();
