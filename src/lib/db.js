import mysql from "mysql2/promise";
import { getSecret } from "astro:env/server";

let pool;
try {
	pool = mysql.createPool({
		host: getSecret("MYSQL_HOST"),
		user: getSecret("MYSQL_USER"),
		password: getSecret("MYSQL_PASSWORD"),
		database: getSecret("MYSQL_DATABASE"),
		waitForConnections: true,
		connectionLimit: 50
	});
} catch (error) {
	console.error("Failed to create database pool:", error);
	process.exit(1);
}

export default pool;
