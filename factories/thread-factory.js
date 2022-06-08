const bcrypt = require("bcrypt");
const uuid = require("uuid");
const Thread = require("../models/thread");

module.exports = class ThreadFactory {
  parse(data) {
    const entity = new Thread();
    Object.assign(entity, data);
    return entity;
  }

  create(data = {}) {
    const { text, delete_password } = data;
    
    const now = new Date();
    return new Thread(
      uuid.v4(),
      text,
      now,
      now,
      bcrypt.hashSync(delete_password, 10),
      false,
      []
    );
  }
};
