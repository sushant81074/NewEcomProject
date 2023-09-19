const mongoose = require("mongoose");

const connectDb = () => {
  mongoose
    .connect(process.env.dbUrl, {})
    .then(() => console.log("database connection successful"))
    .catch((err) => console.log(err.message));
};

module.exports = connectDb;
