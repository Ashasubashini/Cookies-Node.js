/* eslint-disable */
const app = require('./server');
const pool = require('./config/db.config');

pool.connect()
  .then(client => {
    console.log("Database connected successfully");
    client.release();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  });