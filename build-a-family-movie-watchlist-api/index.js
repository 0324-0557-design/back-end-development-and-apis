
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import {
  findByUsername,
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie,
} from './utils/db.js';

import { authenticate } from './middleware/authenticate.js';
import { authorizeModification } from './middleware/authorize.js';

const app = express();

app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET || 'secret';

// LOGIN ROUTE
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      error: 'Username and password required.',
    });
  }

  const user = findByUsername(username);

  if (
    !user ||
    !(await bcrypt.compare(password, user.passwordHash))
  ) {
    return res.status(401).json({
      error: 'Invalid credentials.',
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    SECRET_KEY,
    { expiresIn: '1h' }
  );

  return res.status(200).json({ token });
});

// GET A USER'S WATCHLIST
app.get('/api/watchlist/:userId', authenticate, (req, res) => {
  const userId = Number(req.params.userId);
  const watchlist = getWatchlist(userId);

  if (watchlist === null) {
    return res.status(404).json({
      error: 'User not found.',
    });
  }

  return res.status(200).json(watchlist);
});

// ADD A MOVIE
app.post(
  '/api/watchlist/:userId/movies',
  authenticate,
  authorizeModification,
  (req, res) => {
    const userId = Number(req.params.userId);
    const movie = addMovie(userId, req.body);

    if (movie === null) {
      return res.status(404).json({
        error: 'User not found.',
      });
    }

    return res.status(201).json(movie);
  }
);

// UPDATE A MOVIE
app.put(
  '/api/watchlist/:userId/movies/:movieId',
  authenticate,
  authorizeModification,
  (req, res) => {
    const userId = Number(req.params.userId);
    const movieId = Number(req.params.movieId);

    const movie = updateMovie(userId, movieId, req.body);

    if (movie === null) {
      return res.status(404).json({
        error: 'Movie or user not found.',
      });
    }

    return res.status(200).json(movie);
  }
);

// DELETE A MOVIE
app.delete(
  '/api/watchlist/:userId/movies/:movieId',
  authenticate,
  authorizeModification,
  (req, res) => {
    const userId = Number(req.params.userId);
    const movieId = Number(req.params.movieId);

    const deleted = deleteMovie(userId, movieId);

    if (!deleted) {
      return res.status(404).json({
        error: 'Movie or user not found.',
      });
    }

    return res.status(200).json({
      message: 'Movie removed successfully.',
    });
  }
);

// START SERVER
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
