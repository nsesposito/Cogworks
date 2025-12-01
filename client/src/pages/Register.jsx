import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Client-side validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        setLoading(true);

        const result = await register(username, email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2 className="text-center mb-2">NEW USER REGISTRATION</h2>
                <p className="text-center" style={{ color: 'var(--terminal-green-dim)' }}>
                    &gt; ENTER CREDENTIALS TO CREATE ACCOUNT
                </p>

                <form onSubmit={handleSubmit} className="register-form">
                    {error && <div className="error">&gt; ERROR: {error}</div>}

                    <div className="form-group">
                        <label htmlFor="username">&gt; USERNAME:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="terminal_user"
                            required
                            autoFocus
                            minLength={3}
                            maxLength={50}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">&gt; EMAIL:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@cogworks.terminal"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">&gt; PASSWORD:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">&gt; CONFIRM PASSWORD:</label>
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

                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'CREATING ACCOUNT...' : '[ REGISTER ]'}
                    </button>
                </form>

                <div className="text-center mt-2">
                    <p>&gt; ALREADY REGISTERED? <Link to="/login">LOGIN HERE</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Register;
