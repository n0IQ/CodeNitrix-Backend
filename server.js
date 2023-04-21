const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({
  path: './config.env',
});
const app = require('./index');

// Connect Database
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database Successfully Connected');
  })
  .catch((err) => {
    console.log('Database Error');
  });

// Start Server
const port = 5000 || PORT;
app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
