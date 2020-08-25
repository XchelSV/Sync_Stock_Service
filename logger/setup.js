const log4js = require("log4js");
log4js.configure({
  appenders: { sync: { type: "file", filename: "error.log" } },
  categories: { default: { appenders: ["sync"], level: "error" } }
});

const logger = log4js.getLogger("sync");
module.exports = logger;