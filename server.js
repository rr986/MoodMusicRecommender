import express from 'express';
import Sentiment from 'sentiment';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import saveSong from './src/convex/saveSong.js';
import getSavedSongs from './src/convex/getSavedSongs.js';
const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

const songs = [
  {
    title: "Song A",
    artist: "Artist 1",
    mp3: "song-a.mp3",
    lyrics: "Sample lyrics of song A",
    rating: 4.5,
    popularity: 5000
  },
  {
    title: "Song B",
    artist: "Artist 2",
    mp3: "song-b.mp3",
    lyrics: "Sample lyrics of song B",
    rating: 4.0,
    popularity: 4000
  },
  {
    title: "Song C",
    artist: "Artist 3",
    mp3: "song-c.mp3",
    lyrics: "Sample lyrics of song C",
    rating: 5.0,
    popularity: 10000
  }
];

// Function to make OpenAI API call for sentiment analysis
async function analyzeSentimentUsingOpenAI(lyrics, songTitle) {
  console.log(`Analyzing sentiment for song: ${songTitle} with lyrics: ${lyrics}`);
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'gpt-3.5-turbo',
        prompt: `Analyze the sentiment of the following song lyrics: ${lyrics}. Provide a sentiment score for happiness, sadness, and anger.`,
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const sentiment = response.data.choices[0].text;
    console.log(`Sentiment for song "${songTitle}":`, sentiment);
    return sentiment;  // Return sentiment distribution
  } catch (error) {
    console.error('Error with sentiment analysis:', error);
    return { happy: 0, sad: 0, angry: 0 };  // Default sentiment if there's an error
  }
}

// Function to calculate the closeness of two sentiment distributions
function calculateSentimentCloseness(userSentiment, songSentiment) {
  let totalDifference = 0;
  for (let sentimentType in userSentiment) {
    totalDifference += Math.abs(userSentiment[sentimentType] - songSentiment[sentimentType]);
  }
  return totalDifference;
}

// Route to analyze mood and return recommended songs based on sentiment and popularity
app.get('/recommend', async (req, res) => {
  const moodInput = req.query.mood;
  const sentimentWeight = req.query.sentimentWeight || 0.8;
  const popularityWeight = req.query.popularityWeight || 0.2;

  if (!moodInput) {
    return res.status(400).send({ message: "Please provide a mood input." });
  }

  const sentimentResult = await analyzeSentimentUsingOpenAI(moodInput, 'User Input');

  const userSentiment = {
    angry: sentimentResult.angry || 0,
    sad: sentimentResult.sad || 0,
    happy: sentimentResult.happy || 0
  };

  const recommendedSongs = await Promise.all(songs.map(async (song) => {
    const songSentiment = await analyzeSentimentUsingOpenAI(song.lyrics, song.title); // Get the sentiment for each song
    const closeness = calculateSentimentCloseness(userSentiment, songSentiment);
    const normalizedPopularity = song.popularity / 10000;  // Normalize popularity
    const finalScore = sentimentWeight * (1 / (closeness + 1)) + popularityWeight * normalizedPopularity;

    console.log(`Final score for song "${song.title}":`, finalScore);
    return { ...song, finalScore };
  }));

  // Sort and limit to top 5
  const sortedSongs = recommendedSongs.sort((a, b) => b.finalScore - a.finalScore).slice(0, 5);

  console.log('Recommended songs:', sortedSongs);
  res.send({ userSentiment, recommendedSongs: sortedSongs });
});

// Convex: Save song route
app.post('/save-song', async (req, res) => {
  const { song, userId } = req.body;
  await saveSong({ song, userId });
  res.json({ message: 'Song saved successfully' });
});

// Convex: Get saved songs
app.get('/get-saved-songs', async (req, res) => {
  const { userId } = req.query;
  const savedSongs = await getSavedSongs({ userId });
  res.json(savedSongs);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(port, () => {
  console.log(`Music Mood Recommender app is running at http://localhost:${port}`);
});
