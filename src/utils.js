const Joi = require("joi");
const { validator } = require("cpf-cnpj-validator");

class HttpException extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const joi = Joi.extend(validator);

const missingCpfError = () => new HttpException("CPF is required.", 422);
const invalidCpfError = () => new HttpException("Invalid CPF.", 422);
const nameTooShortError = () =>
  new HttpException("The name must contain at least 2 characters.", 422);
const nameTooLongError = () =>
  new HttpException("The name must contain up to 100 characters.", 422);
const emailTooLongError = () =>
  new HttpException("The email must contain up to 255 characters.", 422);
const invalidEmailError = () =>
  new HttpException("Invalid email address.", 422);
const customerNotFoundError = () =>
  new HttpException("Customer not found.", 404);
/**
 * @param {import('@google-cloud/functions-framework').Response} res
 */
const respondWithSuccess = function (res, data) {
  res.status(200).send(data);
};
/**
 * @param {import('@google-cloud/functions-framework').Response} res
 */
const respondWithError = function (res, error) {
  let status = 500;
  let message = "Internal server error.";

  if (error.message) {
    message = error.message;
  }

  if (error.status) {
    status = error.status;
  }

  res.status(status).send({ error: message });
};
const generateUuid = function () {
  return require("uuid").v4();
};
const sanitizeCpf = function (cpf) {
  if (!cpf) {
    return null;
  }

  const { value, error } = joi.document().cpf().validate(cpf);

  if (error) {
    throw invalidCpfError();
  }

  return value.replace(/\D/g, "");
};
const sanitizeName = function (name) {
  const sanitized = name ? name.trim() : null;

  if (!sanitized) {
    return null;
  }

  if (sanitized.length < 2) {
    throw nameTooShortError();
  }

  if (sanitized.length > 100) {
    throw nameTooLongError();
  }

  return sanitized;
};
const sanitizeEmail = function (email) {
  const sanitized = email ? email.trim() : null;

  if (!sanitized) {
    return null;
  }

  if (sanitized.length > 255) {
    throw emailTooLongError();
  }

  const { value, error } = joi.string().email().validate(sanitized);

  if (error) {
    throw invalidEmailError();
  }

  return value;
};

module.exports = {
  missingCpfError,
  invalidCpfError,
  nameTooShortError,
  nameTooLongError,
  emailTooLongError,
  invalidEmailError,
  customerNotFoundError,
  respondWithSuccess,
  respondWithError,
  generateUuid,
  sanitizeCpf,
  sanitizeName,
  sanitizeEmail,
};
