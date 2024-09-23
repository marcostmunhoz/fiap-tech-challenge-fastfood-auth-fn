const {
  findCustomerByCpf,
  createCustomer,
  updateCustomer,
} = require("./src/database");
const { generateToken } = require("./src/jwt");
const { respondWithError, respondWithSuccess } = require("./src/utils");

/**
 * @param {import('@google-cloud/functions-framework').Request} req
 * @param {import('@google-cloud/functions-framework').Response} res
 */
async function handler(req, res) {
  try {
    const { cpf, name, email } = req.body;

    let customer = await findCustomerByCpf(cpf);

    if (customer && name && email) {
      customer = await updateCustomer({ id: customer.id, name, email });
    }

    if (!customer) {
      customer = await createCustomer({ cpf, name, email });
    }

    respondWithSuccess(res, {
      token: generateToken(customer),
    });
  } catch (error) {
    console.error(error);

    respondWithError(res, error);
  }
}

module.exports = { handler };
