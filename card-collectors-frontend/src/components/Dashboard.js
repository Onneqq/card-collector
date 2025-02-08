import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Temporary hardcoded email for testing
  const adminEmail = 'adampenno93@gmail.com';
  const isAdmin = user?.email && user.email === adminEmail;

  console.log('Admin check:', {
    adminEmail,
    userEmail: user?.email,
    isAdmin
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="user-info">
          {/* TODO: allow users to select a card to use as profile picture */}
          <img 
            src={user?.photoURL} 
            alt="Profile" 
            className="profile-image"
          />
          <div className="user-details">
            <h1>Welcome, {user?.displayName}</h1>
            <p>{user?.email}</p>
          </div>
        </div>
        <div className="header-actions">
          {isAdmin && (
            <button 
              onClick={() => navigate('/admin')} 
              className="admin-button"
            >
              Admin Portal
            </button>
          )}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="stats-container">
          <div className="stat-card">
            <h3>Total Cards</h3>
            <p>0</p>
          </div>
          <div className="stat-card">
            <h3>Collections</h3>
            <p>0</p>
          </div>
          <div className="stat-card">
            <h3>Rare Cards</h3>
            <p>0</p>
          </div>
        </div>

        <div className="actions-container">
          <button className="action-button">View Collection</button>
          <button className="action-button">Add New Cards</button>
          <button className="action-button">Trade Cards</button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard; 