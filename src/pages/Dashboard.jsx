import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as crypto from '../services/crypto';
import * as storage from '../services/storage';
import Button from '../components/Button';

const Dashboard = () => {
    const { encryptionKey, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const storedItems = await storage.getAllItems();
            // Decrypt items to show titles
            const decryptedItems = await Promise.all(storedItems.map(async (item) => {
                try {
                    const iv = new Uint8Array(crypto.base64ToBuffer(item.iv));
                    const ciphertext = crypto.base64ToBuffer(item.ciphertext);
                    const decryptedJson = await crypto.decryptData(ciphertext, iv, encryptionKey);
                    const data = JSON.parse(decryptedJson);
                    return { ...item, ...data };
                } catch (e) {
                    console.error("Failed to decrypt item", item.id, e);
                    return { ...item, title: 'Error decrypting', error: true };
                }
            }));
            setItems(decryptedItems);
        } catch (e) {
            console.error("Error loading items:", e);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // TODO: Show toast
    };

    const handleExport = () => {
        if (!window.confirm("Warning: This will export your passwords in PLAIN TEXT. Keep this file safe!")) return;

        const dataStr = JSON.stringify(items, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
        link.href = url;
        link.click();
        setShowSettings(false);
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const importedItems = JSON.parse(event.target.result);
                if (!Array.isArray(importedItems)) throw new Error("Invalid format");

                setLoading(true);
                let count = 0;
                for (const item of importedItems) {
                    // Skip if missing required fields
                    if (!item.title || !item.password) continue;

                    // Encrypt and save
                    const dataToEncrypt = JSON.stringify({
                        title: item.title,
                        username: item.username || '',
                        password: item.password,
                        url: item.url || '',
                        notes: item.notes || ''
                    });
                    const encrypted = await crypto.encryptData(dataToEncrypt, encryptionKey);

                    const newItem = {
                        title: item.title,
                        iv: crypto.bufferToBase64(encrypted.iv.buffer),
                        ciphertext: crypto.bufferToBase64(encrypted.ciphertext),
                        updatedAt: new Date().toISOString()
                    };

                    await storage.saveItem(newItem);
                    count++;
                }
                alert(`Successfully imported ${count} passwords.`);
                loadItems(); // Reload list
            } catch (err) {
                console.error(err);
                alert("Failed to import: Invalid file format");
            } finally {
                setLoading(false);
                setShowSettings(false);
            }
        };
        reader.readAsText(file);
    };

    const getHealthStatus = (password) => {
        if (!password) return null;
        if (password.length < 8) return { type: 'danger', text: 'Weak' };

        const isReused = items.filter(i => i.password === password).length > 1;
        if (isReused) return { type: 'warning', text: 'Reused' };

        return null;
    };

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
                <h2>Open Sesame</h2>
                <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                    <Button variant="secondary" onClick={toggleTheme} style={{ fontSize: '1.2rem', padding: '0.5rem' }} title="Toggle Theme">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </Button>
                    <Button variant="secondary" onClick={() => setShowSettings(!showSettings)} style={{ fontSize: '1.2rem', padding: '0.5rem' }} title="Settings">
                        ⚙️
                    </Button>
                    {showSettings && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '0.5rem',
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.5rem',
                            minWidth: '150px',
                            zIndex: 1000,
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            <button onClick={handleExport} style={{
                                width: '100%',
                                padding: '0.5rem',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-text)',
                                cursor: 'pointer',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.9rem'
                            }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-border)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                ⬇️ Export Backup
                            </button>
                            <label style={{
                                width: '100%',
                                padding: '0.5rem',
                                display: 'block',
                                cursor: 'pointer',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.9rem'
                            }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-border)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                ⬆️ Import Backup
                                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                            </label>
                        </div>
                    )}
                    <Button variant="secondary" onClick={logout} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                        Logout
                    </Button>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    className="input"
                    placeholder="Search passwords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, minWidth: '200px' }}
                />
                <Button onClick={() => navigate('/add')}>
                    + Add
                </Button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading vault...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                            No passwords found. Add one to get started!
                        </div>
                    ) : (
                        filteredItems.map(item => {
                            const health = getHealthStatus(item.password);
                            return (
                                <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {item.url && (
                                            <img
                                                src={`https://www.google.com/s2/favicons?domain=${item.url}&sz=64`}
                                                alt="icon"
                                                style={{ width: '32px', height: '32px', borderRadius: '4px' }}
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        )}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.title}</h3>
                                                {health && (
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        padding: '0.1rem 0.4rem',
                                                        borderRadius: '999px',
                                                        backgroundColor: health.type === 'danger' ? 'var(--color-danger)' : '#f59e0b',
                                                        color: '#fff',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {health.text}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{item.username}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button
                                            variant="secondary"
                                            style={{ padding: '0.5rem' }}
                                            onClick={() => copyToClipboard(item.password)}
                                            title="Copy Password"
                                        >
                                            📋
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            style={{ padding: '0.5rem' }}
                                            onClick={() => navigate(`/edit/${item.id}`)}
                                            title="Edit"
                                        >
                                            ✏️
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
