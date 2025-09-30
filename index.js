import express from 'express';
import dotenv from 'dotenv';
import router from './app/routes/routes.js';
import Database from './app/config/Database.js';

dotenv.config();

// Database connection
Database();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(router);

app.listen(port, () => console.log(`Server running on port ${port}`));
