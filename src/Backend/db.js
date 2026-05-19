import mysql from "mysql2/promise";

export const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "facebook_clone",
    port: 3306   // aqui sim, usa 3306
});