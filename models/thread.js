const BaseModel = require("./base-model");

module.exports = class Thread extends BaseModel {
  hiddenProperties = ["delete_password", "reported"];

  constructor(
    _id,
    text,
    created_on,
    bumped_on,
    delete_password,
    reported,
    replies
  ) {
    super();
    this._id = _id;
    this.text = text;
    this.created_on = created_on;
    this.bumped_on = bumped_on;
    this.delete_password = delete_password;
    this.reported = reported;
    this.replies = replies;
  }

  withoutHiddenProperties() {
    return Object.entries(this).reduce((copy, entry) => {
      const [key, value] = entry;

      if (!this.hiddenProperties.includes(key)) {
        copy[key] = value;
      }

      return copy;
    }, {});
  }
};
