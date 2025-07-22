const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Game-Pen API running'));

app.listen(5000, () => console.log('Server on http://localhost:5000'));
