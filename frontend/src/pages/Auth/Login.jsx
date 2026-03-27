import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <span>Uni</span>Hub<span className="dot">.</span>
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Enter your credentials to access your account</p>
                </div>

                {error && (
                    <div className="auth-alert">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label>Email Address</label>
                        <div className="auth-input-wrapper">
                            <Mail size={18} className="auth-input-icon" />
                            <input 
                                type="email" 
                                placeholder="name@university.edu" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <div className="label-row">
                            <label>Password</label>
                            <a href="#" className="forgot-link">Forgot?</a>
                        </div>
                        <div className="auth-input-wrapper">
                            <Lock size={18} className="auth-input-icon" />
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Authenticating...' : (
                            <>
                                <span>Sign In</span>
                                <LogIn size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Create one for free <ArrowRight size={14} /></Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
