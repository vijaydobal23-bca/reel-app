// start server
require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');

connectDB();

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}) 
