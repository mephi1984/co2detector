const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const basicAuth = require('basic-auth');


const pool = new Pool({
  user: 'co2detectoruser',
  host: 'localhost',
  database: 'co2detector',
  password: '000@co2detector@', 
  port: 5432,
});

// CREATE TABLE environment_data (
//   id SERIAL PRIMARY KEY,
//   co2_level INT NOT NULL,
//   temperature DOUBLE PRECISION NOT NULL,
//   humidity DOUBLE PRECISION NOT NULL,
//   timestamp TIMESTAMP NOT NULL
// );

// curl -X POST -u co2detectoruser:Co2helloworld# -H "Content-Type: application/json" -d '{"co2_level": 400, "temperature": 22.5, "humidity": 60.5}' https://co2detector.fishrungames.com/data

const app = express();
app.use(bodyParser.json());

const username = 'co2detectoruser';
const password = 'Co2helloworld#';


const authMiddleware = (req, res, next) => {
  const user = basicAuth(req);
  if (!user || user.name !== username || user.pass !== password) {
    res.set('WWW-Authenticate', 'Basic realm="Authorization Required"');
    return res.status(401).send('Unauthorized');
  }
  next();
};


app.post('/data', authMiddleware, async (req, res) => {
  const { co2_level, temperature, humidity } = req.body;

  if (
    typeof co2_level !== 'number' ||
    typeof temperature !== 'number' ||
    typeof humidity !== 'number'
  ) {
    return res.status(400).send('Invalid input data');
  }

  const timestamp = new Date();

  try {
    await pool.query(
      'INSERT INTO environment_data (co2_level, temperature, humidity, timestamp) VALUES ($1, $2, $3, $4)',
      [co2_level, temperature, humidity, timestamp]
    );
    res.status(201).send('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = 8013;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});