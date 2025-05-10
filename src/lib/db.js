import mysql from "mysql2/promise";
import { getSecret } from "astro:env/server";

let pool;
try {
	pool = mysql.createPool({
		host: getSecret("DB_HOST"),
		user: getSecret("DB_USER"),
		password: getSecret("DB_PASSWORD"),
		database: getSecret("DB_NAME"),
		waitForConnections: true,
		connectionLimit: 50
	});
} catch (error) {
	console.error("Failed to create database pool:", error);
	process.exit(1);
}

export default pool;
