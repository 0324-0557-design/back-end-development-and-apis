const express = require('express');
const path = require('path');
const { inputCleaner, inputValidator } = require('./middleware');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static HTML form from public directory
app.use('/form', express.static(path.join(__dirname, 'public')));

// Redirect root GET / to /form
app.get('/', (req, res) => {
  res.redirect('/form');
});

// POST /submit route with route-level middleware
app.post('/submit', inputCleaner, inputValidator, (req, res) => {
  res.send(`Username: ${req.body.username}, Comment: ${req.body.comment}`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});