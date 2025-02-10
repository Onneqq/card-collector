import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { getUserData } from '../utils/firestore';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userData, setUserData] = React.useState(null);
  const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;
  const isAdmin = user?.email && user.email === adminEmail;

  React.useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const data = await getUserData(user.uid);
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

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
            <h3>Owned Images</h3>
            <p>{userData?.ownedImages?.length || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Collections</h3>
            <p>0</p>
          </div>
          <div className="stat-card">
            <h3>Rare Cards</h3>
            <p>0</p>
          </div>
          <div className="stat-card">
            <h3>Pending Packs</h3>
            <p>{userData?.pendingPacks || 0}</p>
            {userData?.pendingPacks > 0 && (
              <button 
                onClick={() => navigate('/packs')} 
                className="action-button"
              >
                Open Packs
              </button>
            )}
          </div>
        </div>

        <div className="actions-container">
          <button 
            onClick={() => navigate('/collection')} 
            className="action-button"
          >
            View Collection
          </button>
          <button className="action-button">Generate AI Art</button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard; 