import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';

function MoodInput({ onSubmit }) {
  const [mood, setMood] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(mood);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="How are you feeling today?"
        variant="outlined"
        fullWidth
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        style={{ marginBottom: '10px' }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
      >
        Get Music Recommendations
      </Button>
    </form>
  );
}

export default MoodInput;
