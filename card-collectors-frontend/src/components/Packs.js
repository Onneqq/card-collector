import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserData, claimPackImages } from '../utils/firestore';
import ImageModal from './ImageModal';
import './Packs.css';

function Packs() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentPack, setCurrentPack] = useState(null);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await getUserData(user.uid);
      setUserData(data);
      if (data.currentPack) {
        setCurrentPack(data.currentPack);
      }
    } catch (err) {
      console.error('Error loading packs:', err);
      setError('Failed to load your packs');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (image) => {
    if (selectedImages.some(selected => selected.key === image.key)) {
      setSelectedImages(selectedImages.filter(selected => selected.key !== image.key));
    } else if (selectedImages.length < 2) {
      setSelectedImages([...selectedImages, image]);
    }
  };

  const handleClaimImages = async () => {
    try {
      setLoading(true);
      await claimPackImages(user.uid, selectedImages);
      navigate('/collection');
    } catch (err) {
      console.error('Error claiming images:', err);
      setError('Failed to claim images');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading packs...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!currentPack) {
    return (
      <div className="packs">
        <header className="packs-header">
          <div className="header-content">
            <div className="header-left">
              <button onClick={() => navigate('/dashboard')} className="back-button">
                Back to Dashboard
              </button>
              <h1>Card Packs</h1>
            </div>
          </div>
        </header>
        <div className="empty-packs">
          <p>You don't have any packs to open right now.</p>
          <p className="hint">Complete challenges or purchase packs to earn more!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="packs">
      <header className="packs-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate('/dashboard')} className="back-button">
              Back to Dashboard
            </button>
            <h1>Open Pack</h1>
          </div>
          <div className="pack-info">
            <span>{currentPack.series} Series Pack</span>
          </div>
        </div>
      </header>

      <div className="pack-instructions">
        <p>Select 2 images from this pack to add to your collection!</p>
        <p className="selected-count">
          Selected: {selectedImages.length}/2
        </p>
      </div>

      <div className="pack-grid">
        {currentPack.images.map((image) => (
          <div 
            key={image.key} 
            className={`pack-item ${
              selectedImages.some(selected => selected.key === image.key) ? 'selected' : ''
            }`}
            onClick={() => handleImageSelect(image)}
          >
            <div className="image-container">
              <img 
                src={image.url} 
                alt={image.name}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(image);
                }}
              />
              {selectedImages.some(selected => selected.key === image.key) && (
                <div className="selected-overlay">
                  <span>✓</span>
                </div>
              )}
            </div>
            <div className="item-info">
              <h3>{image.name}</h3>
              <p>{image.series}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pack-actions">
        <button 
          className="claim-button"
          disabled={selectedImages.length !== 2}
          onClick={handleClaimImages}
        >
          Claim Selected Images
        </button>
      </div>

      {selectedImage && (
        <ImageModal 
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}

export default Packs; 