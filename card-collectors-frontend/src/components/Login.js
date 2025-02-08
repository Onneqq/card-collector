import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import './AuthForms.css';

function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Error during Google login:', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Card Collectors</h2>
        <p className="auth-description">
          Let me know if something breaks so i can fix pls
        </p>
        
        <button 
          onClick={handleGoogleLogin} 
          className="google-auth-button"
        >
          <img 
            src="/google-icon.png" 
            alt="Google" 
            className="google-icon"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
