module.exports = {
  fn: function (filePath) {
    return filePath.split("/").pop().split(".").slice(0, -1).join(".");
  },
};
