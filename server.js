require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const ensureAdmin = require('./src/db/ensureAdmin');

const Port = process.env.PORT || 5000;

connectDB()
  .then(ensureAdmin)
  .then(() => {
    app.listen(Port, () => {
      console.log(`server running at http://localhost:${Port}`);
    });
  });