const express = require('express');
require('dotenv').config();
const app = express();
const pool = require('./db');
const port = process.env.DB_PORT || 3000;

// เพิ่ม express.json() middleware เพื่อแปลง body ของ request ที่เป็น JSON
app.use(express.json());

app.get('/', (req, res) => res.send('Hello World!'));
app.get('/api/student', async (req, res) => {
    try {
        const users = await pool.query('SELECT * FROM student_data');
        res.json(users.rows);
    } catch (err) {
        console.error(`Error while fetching data ${err.message}`);
        console.error(`${process.env.DATABASE_URL}`);
    }
});

app.post('/api/student', async (req, res) => {
    try {
        const { student_name } = req.body;
        const newStudent = await pool.query(
            'INSERT INTO student_data (student_name) VALUES ($1) RETURNING *',
            [student_name]
        );
        res.json(newStudent.rows[0]);
    } catch (err) {
        console.error(`Error while inserting data ${err.message}`);
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
