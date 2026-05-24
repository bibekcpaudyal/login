const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const dbFile = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbFile);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`);
});

function sendError(res, message, status = 400) {
  return res.status(status).json({ success: false, message });
}

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return sendError(res, 'Please fill in all registration fields.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordTrimmed = password.trim();
  const createdAt = new Date().toISOString();

  db.get('SELECT id FROM users WHERE email = ?', normalizedEmail, (err, row) => {
    if (err) return sendError(res, 'Database error. Please try again.');
    if (row) return sendError(res, 'This email is already registered.');

    db.run(
      'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)',
      [name.trim(), normalizedEmail, passwordTrimmed, createdAt],
      function (insertErr) {
        if (insertErr) return sendError(res, 'Unable to create account right now.');
        return res.json({
          success: true,
          message: 'Account created successfully. You can now log in.',
          user: { id: this.lastID, name: name.trim(), email: normalizedEmail }
        });
      }
    );
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 'Please enter both email and password.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordTrimmed = password.trim();

  db.get('SELECT id, name, email, password FROM users WHERE email = ?', normalizedEmail, (err, row) => {
    if (err) return sendError(res, 'Database error. Please try again.');
    if (!row || row.password !== passwordTrimmed) {
      return sendError(res, 'Invalid email or password.');
    }

    return res.json({
      success: true,
      user: { id: row.id, name: row.name, email: row.email }
    });
  });
});

app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return sendError(res, 'Please enter your email address.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  db.get('SELECT id FROM users WHERE email = ?', normalizedEmail, (err, row) => {
    if (err) return sendError(res, 'Database error. Please try again.');
    if (!row) {
      return sendError(res, 'No account found with that email.');
    }

    return res.json({
      success: true,
      message: 'Password recovery instructions have been sent to your email (simulated).'
    });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
