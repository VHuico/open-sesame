import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

const Login = () => {
    const { login, signup } = useAuth();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Firebase Password
    const [masterPassword, setMasterPassword] = useState(''); // Local Master Password
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLoginMode) {
                await login(email, password, masterPassword);
            } else {
                await signup(email, password, masterPassword);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to authenticate');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
            <div className="card">
                <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    {isLoginMode ? 'Open Sesame' : 'Create Account'}
                </h1>

                <form onSubmit={handleSubmit}>
                    <Input
                        type="email"
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                    />

                    <Input
                        type="password"
                        label="Account Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Firebase Password (for syncing)"
                        required
                    />

                    <Input
                        type="password"
                        label="Master Password"
                        value={masterPassword}
                        onChange={(e) => setMasterPassword(e.target.value)}
                        placeholder="Encryption Key (Never sent to server)"
                        required
                    />

                    {error && (
                        <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (isLoginMode ? 'Login' : 'Sign Up')}
                    </Button>

                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={() => setIsLoginMode(!isLoginMode)}
                            style={{ color: 'var(--color-primary)', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                            {isLoginMode ? "Need an account? Sign Up" : "Already have an account? Login"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
