const express = require('express');
require('dotenv').config();
const app = express();
const pool = require('./db');
const port = process.env.DB_PORT || 3000;

app.get('/', (req, res) => res.send('Hello World!'));
app.get('/api/student', async (req, res) => {
    try {
        const users = await pool.query('SELECT *FROM student_data');
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
