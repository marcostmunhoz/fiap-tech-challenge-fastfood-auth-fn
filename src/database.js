const mysql = require("mysql2");
const { promisify } = require("util");
const { database: config } = require("./config");
const {
  sanitizeCpf,
  sanitizeName,
  generateUuid,
  sanitizeEmail,
} = require("./utils");

const pool = mysql.createPool({
  connectionLimit: config.connectionLimit,
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.name,
});
const performQuery = promisify(pool.query).bind(pool);
const findCustomerById = async function (id) {
  const result = await performQuery(
    "SELECT id, name FROM customers WHERE id = ?",
    [id]
  );

  if (result.length === 0) {
    return null;
  }

  return result[0];
};
const findCustomerByCpf = async function (cpf) {
  const sanitizedCpf = sanitizeCpf(cpf);

  if (!sanitizedCpf) {
    return null;
  }

  const result = await performQuery(
    "SELECT id, name FROM customers WHERE cpf = ?",
    [sanitizedCpf]
  );

  if (result.length === 0) {
    return null;
  }

  return result[0];
};
const createCustomer = async function ({ cpf, name, email }) {
  const sanitizedCpf = sanitizeCpf(cpf);
  const sanitizedName = sanitizeName(name);
  const sanitizedEmail = sanitizeEmail(email);
  const now = new Date();
  const id = generateUuid();

  const result = await performQuery(
    "INSERT INTO customers (id, cpf, name, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    [id, sanitizedCpf, sanitizedName, sanitizedEmail, now, now]
  );

  return findCustomerById(id);
};
const updateCustomer = async function ({ id, name, email }) {
  const sanitizedName = sanitizeName(name);
  const sanitizedEmail = sanitizeEmail(email);

  await performQuery(
    "UPDATE customers SET name = ?, email = ?, updated_at = ? WHERE id = ?",
    [sanitizedName, sanitizedEmail, new Date(), id]
  );

  return { id, name: sanitizedName };
};

module.exports = { findCustomerByCpf, createCustomer, updateCustomer };
