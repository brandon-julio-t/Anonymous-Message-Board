const BaseModel = require("./base-model");

module.exports = class Reply extends BaseModel {
  hiddenProperties = ["delete_password", 'reported'];

  constructor(_id, text, created_on, delete_password, reported) {
    super();
    this._id = _id;
    this.text = text;
    this.created_on = created_on;
    this.delete_password = delete_password;
    this.reported = reported;
  }
};
