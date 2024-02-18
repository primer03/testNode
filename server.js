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

app.put('/api/score/', upload.none(), async (req, res) => {
    try {
        const { name, score } = req.body;
        const oldscore = await pool.query('SELECT * FROM scores WHERE name = $1', [name]);
        const updateScore = await pool.query(
            `UPDATE scores SET score = $1 WHERE name = $2 RETURNING *`,
            [parseInt(oldscore.rows[0].score) + parseInt(score), name]
        );
        res.json(updateScore.rows[0]);
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

app.get('/api/messages/createtable', async (req, res) => {
    try {
        const messages = await pool.query(`CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY, 
            generation TEXT NOT NULL, 
            type TEXT NOT NULL,
            url TEXT NOT NULL,
            folder TEXT NOT NULL,
            public_id TEXT NOT NULL,
            width INT NOT NULL,
            height INT NOT NULL,
            active BOOLEAN DEFAULT FALSE
        )`);
        res.json(messages.rows);
    } catch (err) {
        console.error(`Error while creating table ${err.message}`);
    }
});

app.get('/api/messages/count', async (req, res) => {
    try {
        const messages = await pool.query('SELECT COUNT(*) FROM messages');
        if(messages.rows.length == 0) {
            return res.json({status: 'success', message: 'Data already updated', data: {image: 0, video: 0}});
        }else{
            const image = await pool.query('SELECT COUNT(*) FROM messages WHERE type = $1', ['image']);
            const video = await pool.query('SELECT COUNT(*) FROM messages WHERE type = $1', ['video']);
            return res.json({status: 'success', message: 'Data already updated', data: {image: image.rows[0].count, video: video.rows[0].count, total: messages.rows[0].count}});
        }
        
    } catch (err) {
        console.error(`Error while fetching data ${err.message}`);
    }
});

app.post('/api/messages', upload.none(), async (req, res) => {
    try {
        const { generation, type, url, folder, public_id, width, height } = req.body;
        console.log(generation, type, url, folder, public_id, width, height);
        const newMessage = await pool.query(
            'INSERT INTO messages (generation, type, url, folder, public_id, width, height) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [generation, type, url, folder, public_id, width, height]
        );
        res.json({status: 'success', message: 'Data inserted successfully'});
    } catch (err) {
        console.error(`Error while inserting data ${err.message}`);
    }

});

app.get('/api/messages/:public_id', async (req, res) => {
    try {
        const { public_id } = req.params;
        const messages = await pool.query('SELECT * FROM messages WHERE public_id = $1', [public_id]);
        if(messages.rows[0]['active'] == false) {
            const updateMessage = await pool.query(
                'UPDATE messages SET active = $1 WHERE public_id = $2',
                [true, public_id]
            );
            return res.json({status: 'success', message: 'Data updated successfully', data: messages.rows[0]});
        }else{
            return res.json({status: 'error', message: 'Data already updated', data: messages.rows[0]});
        }
    } catch (err) {
        console.error(`Error while fetching data ${err.message}`);
    }
});

app.post('/api/location', upload.none(), async (req, res) => {
    try {
        const { lat, lon} = req.body;
        const newLocation = await pool.query(
            'INSERT INTO location (lat, lon) VALUES ($1, $2) RETURNING *',
            [lat, lon]
        );
        return res.json({status: 'success', message: 'Data inserted successfully',data : newLocation.rows[0]});
    } catch (err) {
        console.error(`Error while inserting data ${err.message}`);
    }
});
// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
