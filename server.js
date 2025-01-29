// Import necessary modules
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Initialize the app
const app = express();
const port = process.env.PORT || 5000;

// Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Middleware
app.use(express.json());
app.use(cors());

// Root Route
app.get('/', (req, res) => {
    res.send('Welcome to the HR Manager API!');
});

// **Helper Functions**

/**
 * Validate specialist data
 */
const validateSpecialist = (data) => {
    const { name, availability_start, availability_end, skills } = data;
    if (!name || !availability_start || !availability_end || !skills || !Array.isArray(skills)) {
        throw new Error('Missing or invalid required fields');
    }
};

/**
 * Validate interview data
 */
const validateInterview = (data) => {
    const { applicant_name, applicant_id, arrival_time, duration_minutes, skills, specialist_id } = data;
    if (!applicant_name || !applicant_id || !arrival_time || !duration_minutes || !skills || !Array.isArray(skills) || !specialist_id) {
        throw new Error('Missing or invalid required fields');
    }
};

/**
 * Check if specialist skills match applicant skills (80% threshold)
 */
const matchSkills = (specialistSkills, applicantSkills) => {
    const matchingSkills = applicantSkills.filter(skill => specialistSkills.includes(skill));
    return (matchingSkills.length / applicantSkills.length) >= 0.8;
};

/**
 * Check for time overlap in interviews
 */
const checkTimeOverlap = async (specialist_id, arrival_time, duration_minutes) => {
    const [overlap] = await pool.query(
        `SELECT * FROM interviews 
         WHERE specialist_id = ? 
         AND TIMESTAMP(arrival_time) < TIMESTAMP(ADDTIME(?, SEC_TO_TIME(? * 60))) 
         AND TIMESTAMP(ADDTIME(arrival_time, SEC_TO_TIME(duration_minutes * 60))) > TIMESTAMP(?)`,
        [specialist_id, arrival_time, duration_minutes, arrival_time]
    );
    return overlap.length > 0;
};

// **CRUD Operations for Specialists**

// Get all specialists
app.get('/api/specialists', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM specialists');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching specialists:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Add a new specialist
app.post('/api/specialists', async (req, res) => {
    try {
        validateSpecialist(req.body);
        const { name, availability_start, availability_end, skills } = req.body;

        const [result] = await pool.query(
            `INSERT INTO specialists (name, availability_start, availability_end, skills) VALUES (?, ?, ?, ?)`,
            [name, availability_start, availability_end, JSON.stringify(skills)]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            availability_start,
            availability_end,
            skills,
        });
    } catch (error) {
        console.error('Error adding specialist:', error);
        res.status(400).json({ error: error.message });
    }
});

// Update specialist
app.put('/api/specialists/:id', async (req, res) => {
    try {
        const { id } = req.params;
        validateSpecialist(req.body);
        const { name, availability_start, availability_end, skills } = req.body;

        const [result] = await pool.query(
            `UPDATE specialists SET name = ?, availability_start = ?, availability_end = ?, skills = ? WHERE id = ?`,
            [name, availability_start, availability_end, JSON.stringify(skills), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Specialist not found' });
        }

        res.json({ id, name, availability_start, availability_end, skills });
    } catch (error) {
        console.error('Error updating specialist:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete specialist
app.delete('/api/specialists/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM specialists WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Specialist not found' });
        }

        res.json({ message: `Specialist with ID ${id} deleted successfully` });
    } catch (error) {
        console.error('Error deleting specialist:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// **CRUD Operations for Interviews**

// Get all interviews
app.get('/api/interviews', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT interviews.*, specialists.name AS specialist_name
             FROM interviews
             JOIN specialists ON interviews.specialist_id = specialists.id`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Add a new interview
app.post('/api/interviews', async (req, res) => {
    try {
        validateInterview(req.body);
        const { applicant_name, applicant_id, arrival_time, duration_minutes, skills, specialist_id } = req.body;

        // Check if specialist exists
        const [specialist] = await pool.query('SELECT * FROM specialists WHERE id = ?', [specialist_id]);
        if (!specialist.length) {
            return res.status(404).json({ error: 'Specialist not found' });
        }

        // Parse specialist skills
        const specialistSkills = JSON.parse(specialist[0].skills);
        if (!Array.isArray(specialistSkills)) {
            throw new Error('Invalid specialist skills format in the database');
        }

        // Check skill match (80% threshold)
        if (!matchSkills(specialistSkills, skills)) {
            return res.status(400).json({ error: 'Specialist skills do not match the applicant' });
        }

        // Check for time overlap
        if (await checkTimeOverlap(specialist_id, arrival_time, duration_minutes)) {
            return res.status(400).json({ error: 'Time overlap with another interview' });
        }

        // Insert interview
        const [result] = await pool.query(
            `INSERT INTO interviews (applicant_name, applicant_id, arrival_time, duration_minutes, skills, specialist_id) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [applicant_name, applicant_id, arrival_time, duration_minutes, JSON.stringify(skills), specialist_id]
        );

        res.status(201).json({
            id: result.insertId,
            applicant_name,
            applicant_id,
            arrival_time,
            duration_minutes,
            skills,
        });
    } catch (error) {
        console.error('Error in POST /api/interviews:', error.message);
        res.status(400).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});