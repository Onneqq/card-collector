import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import { getPresignedUploadUrl, getPublicUrl, listImages } from '../utils/s3';
import ImageModal from './ImageModal';
import { 
  addPackToUser, 
  getAllUsers, 
  distributePacksToAllUsers 
} from '../utils/firestore';

function AdminDashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageData, setImageData] = useState({
    name: '',
    description: '',
    series: '',
    tags: '', // For categorizing images
  });
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const [packCreation, setPackCreation] = useState({
    dateRange: {
      start: '',
      end: tomorrowStr // Set default end date to tomorrow
    }
  });
  const [users, setUsers] = useState([]);
  const [showPackModal, setShowPackModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadImages();
    loadUsers();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const imagesList = await listImages();
      setImages(imagesList);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  console.log('images', images);

  const loadUsers = async () => {
    try {
      const usersList = await getAllUsers();
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setImageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Generate a unique filename
      const fileName = `${Date.now()}-${selectedFile.name}`;
      
      // Get presigned URL
      const { url, key } = await getPresignedUploadUrl(fileName, selectedFile.type);
      
      // Upload to S3
      await fetch(url, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      // Get public URL
      const publicUrl = getPublicUrl(key);
      
      // TODO: Save metadata to Firestore
      console.log('Upload successful:', {
        ...imageData,
        url: publicUrl,
        key,
      });

      // Clear form
      setSelectedFile(null);
      setPreviewUrl(null);
      setImageData({
        name: '',
        description: '',
        series: '',
        tags: '',
      });
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDistributePacks = async () => {
    if (!packCreation.dateRange.start) {
      alert('Please select a start date');
      return;
    }

    try {
      setUploading(true);
      const startDate = new Date(packCreation.dateRange.start);
      const endDate = new Date(packCreation.dateRange.end);

      const filteredImages = images.filter(img => {
        const imageDate = new Date(img.lastModified);
        return imageDate >= startDate && imageDate <= endDate;
      });

      if (filteredImages.length < 5) {
        throw new Error(`Not enough images in selected date range (found ${filteredImages.length}, need at least 5)`);
      }

      // Distribute packs to all users
      await distributePacksToAllUsers(filteredImages);

      alert('Packs distributed successfully to all users!');
      setPackCreation({
        dateRange: {
          start: '',
          end: tomorrowStr
        }
      });
      setShowPackModal(false);
    } catch (error) {
      console.error('Error distributing packs:', error);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  // Cleanup preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <button onClick={() => navigate('/dashboard')} className="back-button">
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="admin-content">
        <section className="image-upload-section">
          <h2>Upload New Base Image</h2>
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="preview-and-inputs">
              <div className="image-preview-container">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="image-preview"
                  />
                ) : (
                  <div className="image-preview-placeholder">
                    Image Preview
                  </div>
                )}
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleFileSelect}
                  required
                  className="file-input"
                />
              </div>

              <div className="form-inputs">
                <div className="form-group">
                  <label htmlFor="name">Image Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={imageData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={imageData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="series">Series</label>
                  <input
                    type="text"
                    id="series"
                    name="series"
                    value={imageData.series}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tags">Tags (comma separated)</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={imageData.tags}
                    onChange={handleInputChange}
                    placeholder="funny, meme, reaction, etc."
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="upload-button"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </form>
        </section>

        <section className="pack-management">
          <h2>Pack Management</h2>
          <button 
            className="create-pack-button"
            onClick={() => setShowPackModal(true)}
          >
            Create New Pack
          </button>
        </section>

        <section className="image-management-section">
          <h2>Manage Images</h2>
          <div className="image-grid">
            {loading ? (
              <div className="loading">Loading images...</div>
            ) : images.length === 0 ? (
              <div className="image-grid-placeholder">
                No images uploaded yet
              </div>
            ) : (
              images.map((image) => (
                <div 
                  key={image.key} 
                  className="image-tile"
                  onClick={() => setSelectedImage(image)}
                >
                  <img src={image.url} alt={image.name} />
                  <div className="image-tile-info">
                    <h3>{image.name}</h3>
                    <p>{image.series}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {showPackModal && (
          <div className="modal-overlay">
            <div className="pack-modal">
              <h2>Distribute Packs to All Users</h2>
              <button 
                className="modal-close"
                onClick={() => setShowPackModal(false)}
              >
                ×
              </button>

              <div className="pack-form">
                <div className="date-selection">
                  <h3>Select Date Range for Pack Images</h3>
                  <div className="date-inputs">
                    <div className="form-group">
                      <label>Start Date:</label>
                      <input
                        type="date"
                        value={packCreation.dateRange.start}
                        onChange={(e) => setPackCreation(prev => ({
                          dateRange: {
                            ...prev.dateRange,
                            start: e.target.value
                          }
                        }))}
                        max={packCreation.dateRange.end}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date:</label>
                      <input
                        type="date"
                        value={packCreation.dateRange.end}
                        onChange={(e) => setPackCreation(prev => ({
                          dateRange: {
                            ...prev.dateRange,
                            end: e.target.value
                          }
                        }))}
                        min={packCreation.dateRange.start}
                        max={tomorrowStr} // Use tomorrow instead of today
                      />
                    </div>
                  </div>
                </div>

                <button
                  className="distribute-button"
                  disabled={!packCreation.dateRange.start || uploading}
                  onClick={handleDistributePacks}
                >
                  {uploading ? 'Distributing...' : 'Distribute Packs to All Users'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedImage && (
        <ImageModal 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
}

export default AdminDashboard; 