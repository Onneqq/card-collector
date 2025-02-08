import React from 'react';
import './ImageModal.css';

function ImageModal({ image, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <img src={image.url} alt={image.name} className="modal-image" />
        <div className="modal-info">
          <h2>{image.name}</h2>
          <p>{image.description}</p>
          {image.series && <p><strong>Series:</strong> {image.series}</p>}
          {image.tags && (
            <div className="modal-tags">
              {image.tags.split(',').map(tag => (
                <span key={tag.trim()} className="tag">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageModal; 