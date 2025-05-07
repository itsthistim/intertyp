import mysql from "mysql2/promise";

const pool = mysql.createPool({
	host: "127.0.0.1",
	user: "root",
	password: "",
	database: "intertypcms",
	waitForConnections: true,
	connectionLimit: 10
});

export default pool;
