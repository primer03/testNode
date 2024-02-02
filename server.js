// Import necessary modules
const express = require('express');
require('dotenv').config();
const cors = require('cors'); // Import CORS module
const app = express();
const pool = require('./db'); // Ensure you have configured your database connection correctly
const port = process.env.DB_PORT || 5000;
const multer = require('multer');
const upload = multer();

// Use CORS middleware for all routes
// This allows all origins, for specific origins, replace '*' with an array of origins e.g., ['http://localhost:3000']
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('Hello World!'));

app.get('/api/score', async (req, res) => {
    try {
        const users = await pool.query('SELECT * FROM scores ORDER BY id ASC');
        res.json(users.rows);
    } catch (err) {
        console.error(`Error while fetching data ${err.message}`);
    }
});

// Example POST route - uncommented for completeness
app.post('/api/score', upload.none(), async (req, res) => {
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

app.get('/api/score/generate', async (req, res) => {
    const scoreData = Array.from({ length: 27 }, (_, index) => {
        return {
            id: index + 1,
            name: `รุ่นที่ ${index + 1}`,
            score: 0,
        };
    });
    try {
        scoreData.forEach(async (data) => {
            const { name, score } = data;
            await pool.query(
                'INSERT INTO scores (id, name, score) VALUES ($1, $2, $3)',
                [data.id, name, score]
            );
        });
        res.json(scoreData);
    } catch (err) {
        console.error(`Error while inserting data ${err.message}`);
    }
});

app.put('/api/score/:id', upload.none(), async (req, res) => {
    try {
        const { id } = req.params;
        var { score } = req.body;
        var oldScore = await pool.query('SELECT * FROM scores WHERE id = $1', [id]);
        oldScore = oldScore.rows[0].score;
        score = parseInt(score) + parseInt(oldScore);
        const updateScore = await pool.query(
            'UPDATE scores SET score = $1 WHERE id = $2',
            [score, id]
        );
        res.json('Data updated successfully');
    } catch (err) {
        console.error(`Error while updating data ${err.message}`);
    }
});

app.get('/api/messages', async (req, res) => {
    try {
        const messages = await pool.query('SELECT * FROM messages ORDER BY id ASC');
        res.json(messages.rows);
    } catch (err) {
        console.error(`Error while fetching data ${err.message}`);
    }
});

app.get('/api/messages/count', async (req, res) => {
    try {
        const messages = await pool.query('SELECT COUNT(*) FROM messages');
        res.json(messages.rows);
    } catch (err) {
        console.error(`Error while fetching data ${err.message}`);
    }
});

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
