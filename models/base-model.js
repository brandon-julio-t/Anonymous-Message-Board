module.exports = class BaseModel {
  hiddenProperties = [];

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
