import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  ArrowLeft,
  ChevronRight,
  Filter,
  UserCheck,
  UserX
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './UsersList.css';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get('http://localhost:5050/api/users', config);
                setUsers(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="admin-loading-container">
                <div className="admin-loader"></div>
                <p>Retrieving User Database...</p>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main-content">
                <div className="users-list-container animate-fade-in">
                    <header className="users-list-header">
                        <div className="header-nav">
                            <button className="back-btn" onClick={() => navigate('/admin-profile')}>
                                <ArrowLeft size={18} />
                                <span>Back to Profile</span>
                            </button>
                        </div>
                        <div className="header-title-section">
                            <div className="title-icon-box">
                                <Users size={28} />
                            </div>
                            <div>
                                <h1>User Management</h1>
                                <p>Monitor and manage all registered system users</p>
                            </div>
                        </div>
                    </header>

                    <div className="users-controls">
                        <div className="search-wrapper">
                            <Search size={18} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search by name or email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-group">
                            <button className="control-btn">
                                <Filter size={16} />
                                <span>Filter</span>
                            </button>
                            <div className="user-count-badge">
                                <strong>{filteredUsers.length}</strong> Users Found
                            </div>
                        </div>
                    </div>

                    <div className="admin-glass-card users-table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>User Info</th>
                                    <th>Contact Details</th>
                                    <th>Status & Role</th>
                                    <th>Joined Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id} className="user-row">
                                            <td>
                                                <div className="user-info-cell">
                                                    <div className="user-avatar-small">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="user-name-box">
                                                        <span className="user-name">{user.name}</span>
                                                        <span className="user-id">ID: {user._id.substring(0, 8)}...</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="contact-info">
                                                    <div className="contact-item">
                                                        <Mail size={14} />
                                                        <span>{user.email}</span>
                                                    </div>
                                                    <div className="contact-item">
                                                        <Phone size={14} />
                                                        <span>{user.phoneNumber || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="role-status-cell">
                                                    <span className={`badge ${user.isAdmin ? 'admin' : 'student'}`}>
                                                        <Shield size={12} />
                                                        {user.isAdmin ? 'Administrator' : 'Student'}
                                                    </span>
                                                    <span className="status-indicator">
                                                        <UserCheck size={12} />
                                                        Active
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="date-cell">
                                                    <Calendar size={14} />
                                                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <button className="row-action-btn">
                                                    View Details
                                                    <ChevronRight size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="empty-state">
                                            <div className="empty-content">
                                                <UserX size={48} />
                                                <p>No users found matching "{searchTerm}"</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UsersList;
