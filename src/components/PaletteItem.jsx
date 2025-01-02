import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import usePalettes from '../hooks/usePalettes';

const PaletteItem = ({ palette }) => {
  const { user } = useAuth();
  const { upvotePalette } = usePalettes();
  const [upvoted, setUpvoted] = useState(
    user && palette.upvoters?.includes(user._id)
  );

  const handleUpvote = async (e) => {
    e.preventDefault();
    if (!upvoted) {
      try {
        await upvotePalette(palette._id);
        setUpvoted(true);
      } catch (error) {
        console.error('Error upvoting palette:', error);
      }
    }
  };

  const isOwner = palette.userId === user?._id;

  return (
    <div className={`palette-item ${isOwner ? 'owner' : ''}`}>
      <div className="palette-content">
        <h3>{palette.name}</h3>
        <div className="color-swatches">
          {palette.colors?.map((color, index) => (
            <div 
              key={index}
              className="color-swatch"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <p>Created by: {palette.username}</p>
        <p>Votes: {palette.votes || 0}</p>
      </div>
      
      <button
        className={`upvote-button ${upvoted ? 'disabled' : 'upvotable'}`}
        onClick={handleUpvote}
        disabled={upvoted}
      >
        {upvoted ? 'Upvoted' : 'Upvote'}
      </button>
    </div>
  );
};

export default PaletteItem;
