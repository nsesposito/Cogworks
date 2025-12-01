import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
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
            navigate('/dashboard');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="ascii-art">
                    <pre>{`
  ██████╗ ██████╗  ██████╗ ██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗███████╗
 ██╔════╝██╔═══██╗██╔════╝ ██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝██╔════╝
 ██║     ██║   ██║██║  ███╗██║ █╗ ██║██║   ██║██████╔╝█████╔╝ ███████╗
 ██║     ██║   ██║██║   ██║██║███╗██║██║   ██║██╔══██╗██╔═██╗ ╚════██║
 ╚██████╗╚██████╔╝╚██████╔╝╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗███████║
  ╚═════╝ ╚═════╝  ╚═════╝  ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
          `}</pre>
                </div>

                <h2 className="text-center mb-2">SYSTEM LOGIN</h2>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="error">&gt; ERROR: {error}</div>}

                    <div className="form-group">
                        <label htmlFor="email">&gt; EMAIL:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@cogworks.terminal"
                            required
                            autoFocus
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
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'AUTHENTICATING...' : '[ LOGIN ]'}
                    </button>
                </form>

                <div className="text-center mt-2">
                    <p>&gt; NEW USER? <Link to="/register">CREATE ACCOUNT</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Login;
