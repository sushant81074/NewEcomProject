const app = require("./app");
const connectDb = require("./database/index");

const dotenv = require("dotenv");

dotenv.config({
  path: ".env",
});

const startServer = () => {
  app.listen(process.env.PORT, () => {
    console.log(`server is running on port : ${process.env.PORT}`);
  });
};

const main = () => {
  connectDb();
  startServer();
};

main();
