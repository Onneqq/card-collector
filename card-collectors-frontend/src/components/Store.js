import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserData, purchaseImage } from '../utils/firestore';
import { listImages } from '../utils/s3';
import ImageModal from './ImageModal';
import { useNavigate } from 'react-router-dom';
import './Store.css';

function Store() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userDataResult, imagesResult] = await Promise.all([
        getUserData(user.uid),
        listImages()
      ]);
      
      setUserData(userDataResult);
      setImages(imagesResult);
    } catch (err) {
      console.error('Error loading store data:', err);
      setError('Failed to load store data');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (image) => {
    if (!userData || purchasing) return;

    try {
      setPurchasing(true);
      const price = 50; // We can make this dynamic based on rarity later

      if (userData.breadBalance < price) {
        throw new Error(`Insufficient $BREAD balance. You need ${price} $BREAD to purchase this image.`);
      }

      await purchaseImage(user.uid, {
        key: image.key,
        url: image.url,
        name: image.name,
        description: image.description || '',
        series: image.series || '',
      }, price);
      
      // Refresh user data to show updated balance
      const updatedUserData = await getUserData(user.uid);
      setUserData(updatedUserData);
      
      // Show success message
      alert('Image purchased successfully! Check your collection to view it.');
    } catch (err) {
      console.error('Error purchasing image:', err);
      alert(err.message);
    } finally {
      setPurchasing(false);
    }
  };

  const isImageOwned = (imageKey) => {
    return userData?.ownedImages?.some(owned => owned.key === imageKey);
  };

  if (loading) {
    return <div className="loading">Loading store...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="store">
      <header className="store-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="back-button"
            >
              Back to Dashboard
            </button>
            <h1>Image Store</h1>
          </div>
          <div className="bread-balance">
            <span>$BREAD Balance:</span>
            <strong>{userData?.breadBalance || 0}</strong>
          </div>
        </div>
      </header>

      <div className="store-grid">
        {images.map((image) => (
          <div key={image.key} className="store-item">
            <img 
              src={image.url} 
              alt={image.name}
              onClick={() => setSelectedImage(image)}
            />
            <div className="item-info">
              <h3>{image.name}</h3>
              <p>{image.series}</p>
              <button 
                className={`purchase-button ${isImageOwned(image.key) ? 'owned' : ''}`}
                onClick={() => handlePurchase(image)}
                disabled={isImageOwned(image.key) || purchasing}
              >
                {isImageOwned(image.key)
                  ? 'Owned'
                  : purchasing 
                    ? 'Purchasing...' 
                    : 'Purchase for 50 $BREAD'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <ImageModal 
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          owned={isImageOwned(selectedImage.key)}
          onPurchase={
            !isImageOwned(selectedImage.key) 
              ? () => handlePurchase(selectedImage)
              : undefined
          }
        />
      )}
    </div>
  );
}

export default Store; 