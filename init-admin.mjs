import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

const DATABASE_URL = process.env.DATABASE_URL;

async function initAdmin() {
  if (!DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection(DATABASE_URL);
    const db = drizzle(connection);

    // Hash da senha "escobar10"
    const passwordHash = await bcrypt.hash("escobar10", 10);

    // Inserir credenciais de admin
    await connection.execute(
      "INSERT INTO admin_credentials (username, passwordHash) VALUES (?, ?) ON DUPLICATE KEY UPDATE passwordHash = ?",
      ["volta", passwordHash, passwordHash]
    );

    console.log("✅ Admin credentials initialized successfully!");
    console.log("Username: volta");
    console.log("Password: escobar10");

    await connection.end();
  } catch (error) {
    console.error("Error initializing admin:", error);
    process.exit(1);
  }
}

initAdmin();
