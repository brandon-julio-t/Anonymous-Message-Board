const uuid = require("uuid");
const bcrypt = require("bcrypt");
const Reply = require("../models/reply");

module.exports = class ReplyFactory {
  parse(data) {
    const entity = new Reply();
    Object.assign(entity, data);
    return entity;
  }

  create(data = {}) {
    const { text, delete_password } = data;

    const now = new Date();
    return new Reply(
      uuid.v4(),
      text,
      now,
      bcrypt.hashSync(delete_password, 10),
      false
    );
  }
};
