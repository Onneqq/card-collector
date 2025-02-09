import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserData } from '../utils/firestore';
import ImageModal from './ImageModal';
import './Collection.css';

function Collection() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [viewType, setViewType] = useState('images');
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await getUserData(user.uid);
      setUserData(data);
    } catch (err) {
      console.error('Error loading collection:', err);
      setError('Failed to load your collection');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredImages = () => {
    if (!userData?.ownedImages) return [];
    if (filter === 'all') return userData.ownedImages;
    return userData.ownedImages.filter(img => img.series === filter);
  };

  const getSeries = () => {
    if (!userData?.ownedImages) return [];
    const series = new Set(userData.ownedImages.map(img => img.series));
    return ['all', ...Array.from(series)];
  };

  const removeFileExtension = (filename) => {
    return filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
  };

  if (loading) {
    return <div className="loading">Loading collection...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const filteredImages = getFilteredImages();

  return (
    <div className="collection">
      <header className="collection-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="back-button"
            >
              Back to Dashboard
            </button>
            <h1>My Collection</h1>
          </div>
          <div className="collection-stats">
            <span>Total Images: {userData?.ownedImages?.length || 0}</span>
          </div>
        </div>
      </header>

      <div className="collection-controls">
        <div className="view-toggle">
          <button 
            className={`toggle-button ${viewType === 'images' ? 'active' : ''}`}
            onClick={() => setViewType('images')}
          >
            Images
          </button>
          <button 
            className={`toggle-button ${viewType === 'cards' ? 'active' : ''}`}
            onClick={() => setViewType('cards')}
          >
            Cards
          </button>
        </div>
        {viewType === 'images' && (
          <div className="series-filter">
            <label>Filter by Series:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
            >
              {getSeries().map(series => (
                <option key={series} value={series}>
                  {series === 'all' ? 'All Series' : series}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {viewType === 'images' ? (
        <>
          {filteredImages.length === 0 ? (
            <div className="empty-collection">
              <p>No images in your collection yet.</p>
              <button 
                onClick={() => navigate('/store')} 
                className="store-button"
              >
                Browse Store
              </button>
            </div>
          ) : (
            <div className="collection-grid">
              {filteredImages.map((image) => (
                <div 
                  key={`${image.key}-${image.purchasedAt}`} 
                  className="collection-item"
                  onClick={() => setSelectedImage(image)}
                >
                  <img src={image.url} alt={image.name} />
                  <div className="item-info">
                    <h3>{removeFileExtension(image.name)}</h3>
                    <p>{image.series}</p>
                    <div className="item-details">
                      <span>Acquired: {new Date(image.purchasedAt.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="empty-collection">
          <p>Card collecting feature coming soon!</p>
          <p className="coming-soon">
            Stay tuned for exciting card collecting features where you can trade, 
            battle, and showcase your unique card collection.
          </p>
        </div>
      )}

      {selectedImage && (
        <ImageModal 
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          owned={true}
        />
      )}
    </div>
  );
}

export default Collection; 