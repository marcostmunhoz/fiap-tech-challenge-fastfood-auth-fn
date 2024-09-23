const jwt = require('jsonwebtoken');
const { jwt: config } = require('./config');

module.exports = {
  generateToken: function ({id, name}) {
    return jwt.sign({sub: id, name}, config.secret, {
      expiresIn: config.expiration,
    });
  },
};
