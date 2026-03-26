import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Support.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/support/admin/login', {
        username,
        password
      });
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUsername', data.username);
      navigate('/admin/support-tickets');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="support-container" style={{ maxWidth: '400px' }}>
      <h2 className="support-title">Support Admin Login</h2>
      {error && <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
      
      <form onSubmit={handleLogin} className="support-form">
        <div className="form-group">
          <label>Admin Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            placeholder="Username" 
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Password" 
          />
        </div>
        
        <button type="submit" className="submit-btn" style={{ marginTop: '10px' }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
