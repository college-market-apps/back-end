const { db } = require("./db");
require("dotenv").config();
const app = require("./api");
const http = require("http");
const PORT = process.env.PORT || 3000

const httpServer = http.createServer(app);
db.sync()
  .then(() => {
    httpServer.listen(PORT, () =>
      console.log(`Express server listening at ${PORT}`)
    );
  });
