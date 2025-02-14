import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import saveSong from './src/convex/saveSong.js';
import getSavedSongs from './src/convex/getSavedSongs.js';

const app = express();
const port = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Analyzes text for sentiment using OpenAI.
 * Returns a JSON object with keys: { happy, sad, angry }.
 */
async function analyzeSentimentUsingOpenAI(text, label) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a sentiment analyzer for music moods.' },
          {
            role: 'user',
            content: `Analyze the sentiment of the following text labeled "${label}": ${text}. Provide numeric scores between 0 and 1 for happiness, sadness, and anger in valid JSON format (e.g., {"happy":0.7,"sad":0.2,"angry":0.1}).`
          }
        ],
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const content = response.data.choices[0].message.content.trim();
    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing sentiment:', error.response ? error.response.data : error.message);
    return { happy: 0, sad: 0, angry: 0 };
  }
}

/**
 * Asks OpenAI to recommend exactly 3 songs matching the user mood.
 * Each song should include:
 * - "title": song title,
 * - "artist": artist name,
 * - "lyricsSnippet": a short snippet of lyrics (optional),
 * - "youtubeLink": a verified YouTube link,
 * - "sentiment": a JSON object with keys {"happy", "sad", "angry"},
 * - "popularity": a numeric value between 0 and 1.
 *
 * Returns an array of 3 song objects.
 */
async function getThreeSongsFromOpenAI(userMood) {
  const prompt = `
    The user mood is: "${userMood}". Please recommend exactly 3 songs that match this mood.
    For each song, provide:
      - "title": the title of the song,
      - "artist": the name of the artist,
      - "lyricsSnippet": a short snippet of lyrics (optional),
      - "youtubeLink": a fully verified YouTube link for the song,
      - "sentiment": a JSON object with numeric values for {"happy": x, "sad": y, "angry": z},
      - "popularity": a numeric value between 0 and 1 representing the song's popularity.
    Return ONLY a valid JSON array (with exactly 3 objects) with no extra text.
  `;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a music recommendation engine.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 700,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    let content = response.data.choices[0].message.content.trim();

    // Remove Markdown code fences if present.
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching songs from OpenAI:', error.response ? error.response.data : error.message);
    return [];
  }
}


/**
 * Calculates the sentiment closeness between the user and a song.
 * Returns a value where a higher number indicates a closer match.
 */
function calculateSentimentCloseness(userSentiment, songSentiment) {
  let totalDifference = 0;
  ['happy', 'sad', 'angry'].forEach(key => {
    totalDifference += Math.abs((userSentiment[key] || 0) - (songSentiment[key] || 0));
  });
  return 1 / (1 + totalDifference);
}

/**
 * Temporary route: /temp-recommend
 * 1. Analyzes the user's mood using OpenAI.
 * 2. Calls OpenAI to request 3 songs (each with title, artist, lyricsSnippet, youtubeLink, sentiment, and popularity).
 * 3. Calculates a final score for each song based on:
 *      finalScore = (sentimentWeight * closenessScore) + (popularityWeight * popularity)
 * 4. Sorts the songs from best to worst match.
 * 5. Returns the ranked list.
 *
 * Expects query parameters:
 * - mood (required)
 * - sentimentWeight (optional, default: 0.8)
 * - popularityWeight (optional, default: 0.2)
 */
app.get('/temp-recommend', async (req, res) => {
  const { mood, sentimentWeight, popularityWeight } = req.query;
  if (!mood) {
    return res.status(400).json({ message: 'Please provide a "mood" query parameter.' });
  }
  const sentimentW = parseFloat(sentimentWeight) || 0.8;
  const popularityW = parseFloat(popularityWeight) || 0.2;

  try {
    // Step 1: Analyze the user's mood to get sentiment scores.
    const userSentiment = await analyzeSentimentUsingOpenAI(mood, 'User Mood');

    // Step 2: Request 3 song recommendations from OpenAI.
    const songsFromOpenAI = await getThreeSongsFromOpenAI(mood);

    // Step 3: Score each song.
    const scoredSongs = songsFromOpenAI.map(song => {
      const closenessScore = calculateSentimentCloseness(userSentiment, song.sentiment || {});
      const popularity = song.popularity !== undefined ? parseFloat(song.popularity) : 0.5; // Default if missing
      const finalScore = sentimentW * closenessScore + popularityW * popularity;
      return { ...song, closenessScore, finalScore };
    });

    // Step 4: Sort songs from best (highest finalScore) to worst.
    scoredSongs.sort((a, b) => b.finalScore - a.finalScore);

    res.json({
      userMood: mood,
      userSentiment,
      recommendedSongs: scoredSongs
    });
  } catch (error) {
    console.error('Error in /temp-recommend:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// --- Other existing routes remain unchanged ---

app.get('/youtube-search', async (req, res) => {
  const { title, artist } = req.query;
  if (!title || !artist) {
    return res.status(400).send({ message: "Please provide both song title and artist." });
  }

  async function searchYouTube(songTitle, artist) {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: `${songTitle} ${artist}`,
          type: 'video',
          key: YOUTUBE_API_KEY,
          maxResults: 1
        }
      });
      if (response.data.items.length > 0) {
        const videoId = response.data.items[0].id.videoId;
        return `https://www.youtube.com/watch?v=${videoId}`;
      } else {
        console.log('No video found for this song.');
        return null;
      }
    } catch (error) {
      console.error('Error searching YouTube:', error);
      return null;
    }
  }

  const videoUrl = await searchYouTube(title, artist);
  if (videoUrl) {
    res.json({ url: videoUrl });
  } else {
    res.status(404).send({ message: 'No video found for this song.' });
  }
});

app.get('/recommend', async (req, res) => {
  res.send({ message: "Old /recommend route" });
});

app.post('/save-song', async (req, res) => {
  const { song, userId } = req.body;
  await saveSong({ song, userId });
  res.json({ message: 'Song saved successfully' });
});

app.get('/get-saved-songs', async (req, res) => {
  const { userId } = req.query;
  const savedSongs = await getSavedSongs({ userId });
  res.json(savedSongs);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Music Mood Recommender app is running on port ${port}`);
});
