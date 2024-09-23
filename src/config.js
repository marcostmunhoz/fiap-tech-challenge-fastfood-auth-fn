require("dotenv").config();

module.exports = {
  database: {
    connectionLimit: 1,
    socketPath: process.env.MYSQL_DATABASE_SOCKET_PATH,
    host: process.env.MYSQL_DATABASE_HOST,
    port: process.env.MYSQL_DATABASE_PORT || 3306,
    username: process.env.MYSQL_DATABASE_USERNAME,
    password: process.env.MYSQL_DATABASE_PASSWORD,
    name: process.env.MYSQL_DATABASE_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION || "1h",
  },
};
