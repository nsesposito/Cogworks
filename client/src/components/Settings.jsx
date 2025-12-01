import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import './Settings.css';

function Settings() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API_URL}/auth/change-password`, {
                currentPassword,
                newPassword
            });

            setSuccess('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-container">
            <h2>&gt; SETTINGS</h2>

            <section className="settings-section">
                <h3>&gt; CHANGE PASSWORD</h3>
                <form onSubmit={handlePasswordChange} className="settings-form">
                    {error && <div className="error">&gt; ERROR: {error}</div>}
                    {success && <div className="success">&gt; SUCCESS: {success}</div>}

                    <div className="form-group">
                        <label htmlFor="currentPassword">&gt; CURRENT PASSWORD:</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">&gt; NEW PASSWORD:</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">&gt; CONFIRM NEW PASSWORD:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-submit">
                        {loading ? 'UPDATING...' : '[ CHANGE PASSWORD ]'}
                    </button>
                </form>
            </section>
        </div>
    );
}

export default Settings;
