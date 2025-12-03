import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

const UnlockVault = () => {
    const { unlockVault, user } = useAuth();
    const [masterPassword, setMasterPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await unlockVault(masterPassword);
        } catch (err) {
            console.error(err);
            setError('Failed to unlock vault. Please check your master password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
            <div className="card">
                <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    Unlock Vault
                </h1>

                <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    Welcome back, {user?.email}
                </p>

                <form onSubmit={handleSubmit}>
                    <Input
                        type="password"
                        label="Master Password"
                        value={masterPassword}
                        onChange={(e) => setMasterPassword(e.target.value)}
                        placeholder="Enter your master password"
                        required
                        autoFocus
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
                        {loading ? 'Unlocking...' : 'Unlock'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default UnlockVault;
