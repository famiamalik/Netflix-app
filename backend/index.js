const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const TMDB_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/trending', async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/trending/all/week?api_key=${TMDB_KEY}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

app.get('/api/movie/:id', async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/movie/${req.params.id}?api_key=${TMDB_KEY}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    const { data } = await axios.get(`${BASE_URL}/search/movie?api_key=${TMDB_KEY}&query=${query}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search' });
  }
});

app.listen(5000, () => {
  console.log('Backend running on port 5000');
});