import React, { useState } from 'react';
import usePalettes from '../hooks/usePalettes';
import { useToast } from './Toast';

const PaletteItem = ({ palette, onDelete }) => {
  const { votePalette, unvotePalette } = usePalettes();
  const { showToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleVoteToggle = async (e) => {
    e.preventDefault();
    try {
      if (palette.voted) {
        await unvotePalette(palette.id);
        showToast('Vote removed', 'success');
      } else {
        await votePalette(palette.id);
        showToast('Vote added', 'success');
      }
    } catch (error) {
      showToast('Error updating vote', 'error');
      console.error('Error toggling vote:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(palette.id);
      showToast('Palette deleted successfully', 'success');
      setShowDeleteConfirm(false);
    } catch (error) {
      showToast('Error deleting palette', 'error');
      console.error('Error deleting palette:', error);
    }
  };

  const handleCopyToClipboard = () => {
    const colorList = palette.colors.join(', ');
    navigator.clipboard.writeText(colorList).then(() => {
      showToast('Colors copied to clipboard', 'success');
    }).catch(() => {
      showToast('Failed to copy colors', 'error');
    });
  };

  return (
    <div className="palette-item">
        <div className="palette-header">
          <h3>{palette.name}</h3>
        </div>

        <div className="color-swatches">
          {palette.colors?.map((color, index) => (
            <div 
              key={index}
              className="color-swatch"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        <div className="palette-info">
          <span className="created-at">
            Created: {new Date(palette.createdAt).toLocaleDateString()}
          </span>
          <span className="votes-count">
            {palette.votes || 0} vote{(palette.votes !== 1) ? 's' : ''}
          </span>
        </div>
        
        <div className="palette-actions">
          <button
            className="palette-action-btn copy-button"
            onClick={handleCopyToClipboard}
            title="Copy colors to clipboard"
          >
            Copy
          </button>
          <button
            className={`palette-action-btn vote-button ${palette.voted ? 'voted' : ''}`}
            onClick={handleVoteToggle}
            title={palette.voted ? 'Remove vote' : 'Add vote'}
          >
            {palette.voted ? 'Voted' : 'Vote'}
          </button>
          <button
            className="palette-action-btn delete-button"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete palette"
          >
            Delete
          </button>
        </div>

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-dialog">
            <p>Are you sure you want to delete this palette?</p>
            <div className="delete-confirm-actions">
              <button 
                className="confirm-button delete"
                onClick={handleDelete}
              >
                Delete
              </button>
              <button 
                className="confirm-button cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaletteItem;
