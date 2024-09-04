const express = require('express');
const Sentiment = require('sentiment');
const app = express();
const port = 3000;

app.use(express.static('public'));  // Serves your HTML, CSS, and JS files from the 'public' folder

// Sample data
const albums = {
  happy: [
    { title: "Album A - Upbeat Vibes", artist: "Artist 1", mp3: "song-a.mp3" },
    { title: "Album B - Sunny Days", artist: "Artist 2", mp3: "song-b.mp3" }
  ],
  sad: [
    { title: "Album C - Melancholy Beats", artist: "Artist 3", mp3: "song-c.mp3" },
    { title: "Album D - Rainy Nights", artist: "Artist 4", mp3: "song-d.mp3" }
  ],
  angry: [
    { title: "Album E - Rage and Roar", artist: "Artist 5", mp3: "song-e.mp3" },
    { title: "Album F - Thunderstorm", artist: "Artist 6", mp3: "song-f.mp3" }
  ]
};

// Initialize sentiment analysis
const sentiment = new Sentiment();

// Route to analyze mood and return recommendations
app.get('/recommend', (req, res) => {
  const moodInput = req.query.mood;
  if (!moodInput) {
    return res.status(400).send({ message: "Please provide a mood input." });
  }

  // Analyze mood sentiment
  const sentimentResult = sentiment.analyze(moodInput);
  const sentimentScore = sentimentResult.score;

  let mood = '';

  // Based on sentiment score, determine mood (you can modify these ranges)
  if (sentimentScore > 1) {
    mood = 'happy';
  } else if (sentimentScore < -1) {
    mood = 'sad';
  } else {
    mood = 'angry';
  }

  // Return the corresponding albums based on mood
  const recommendedAlbums = albums[mood];
  if (recommendedAlbums) {
    res.send({ mood: mood, albums: recommendedAlbums });
  } else {
    res.status(404).send({ message: "No recommendations available for this mood." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Music Mood Recommender app is running at http://localhost:${port}`);
});
