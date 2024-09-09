import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MoodInput from './components/MoodInput.js';
import AlbumList from './components/AlbumList.js';
import SavedAlbums from './components/SavedAlbums.js';
import { useMutation, useQuery } from "convex/react";

const AppContainer = styled.div`
  padding: 35px;
  max-width: 1200px;
  margin: 0 auto;
`;

function App() {
  const [albums, setAlbums] = useState([]);
  const [savedAlbums, setSavedAlbums] = useState([]);  // Local state for saved albums
  const [sentimentWeight, setSentimentWeight] = useState(0.8);
  const [popularityWeight, setPopularityWeight] = useState(0.2);

  const userId = "user-id";

  const saveSongMutation = useMutation('saveSong');
  const deleteSongMutation = useMutation('deleteSong');
  const savedAlbumsQuery = useQuery('getSavedSongs', { userId }) || [];

  // Sync the saved albums from Convex query to local state
  useEffect(() => {
    setSavedAlbums(savedAlbumsQuery);
  }, [savedAlbumsQuery]);

  const fetchRecommendations = (mood) => {
    fetch(`/recommend?mood=${encodeURIComponent(mood)}&sentimentWeight=${sentimentWeight}&popularityWeight=${popularityWeight}`)
      .then(response => response.json())
      .then(data => {
        if (data.recommendedSongs) {
          setAlbums(data.recommendedSongs);
        } else {
          setAlbums([]);
        }
      })
      .catch(error => {
        console.error('Error fetching recommendations:', error);
      });
  };

  const saveForLater = (album) => {
    saveSongMutation({ song: album, userId }).then(() => {
      console.log('Song saved successfully');
    }).catch(error => {
      console.error('Error saving song:', error);
    });
  };

  const handleDelete = (songId) => {
    deleteSongMutation({ songId }).then(() => {
      console.log(`Song with ID ${songId} deleted successfully`);
      // Update local state to reflect the deletion
      const updatedAlbums = savedAlbums.filter((album) => album._id !== songId);
      setSavedAlbums(updatedAlbums);
    }).catch(error => {
      console.error('Error deleting song:', error);
    });
  };

  return (
    <AppContainer>
      <h1>Music Mood Recommender</h1>
      <MoodInput onSubmit={fetchRecommendations} />
      <div>
        <label>Adjust Sentiment Weight: {sentimentWeight}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={sentimentWeight}
          onChange={(e) => setSentimentWeight(Number(e.target.value))}
        />
        <label>Adjust Popularity Weight: {popularityWeight}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={popularityWeight}
          onChange={(e) => setPopularityWeight(Number(e.target.value))}
        />
      </div>
      <AlbumList albums={albums} onSave={saveForLater} />
      <SavedAlbums albums={savedAlbums} handleDelete={handleDelete} />
    </AppContainer>
  );
}

export default App;

