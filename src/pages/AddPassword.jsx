import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as crypto from '../services/crypto';
import * as storage from '../services/storage';
import Button from '../components/Button';
import Input from '../components/Input';
import PasswordGenerator from '../components/PasswordGenerator';

const AddPassword = () => {
    const { encryptionKey } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams(); // If editing

    const [formData, setFormData] = useState({
        title: '',
        username: '',
        password: '',
        url: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            loadItem(id);
        }
    }, [id]);

    const loadItem = async (itemId) => {
        try {
            const storedItems = await storage.getAllItems();
            const item = storedItems.find(i => i.id === parseInt(itemId));
            if (item) {
                const iv = new Uint8Array(crypto.base64ToBuffer(item.iv));
                const ciphertext = crypto.base64ToBuffer(item.ciphertext);
                const decryptedJson = await crypto.decryptData(ciphertext, iv, encryptionKey);
                const data = JSON.parse(decryptedJson);
                setFormData({ ...data });
            } else {
                setError('Item not found');
            }
        } catch (e) {
            console.error("Error loading item:", e);
            setError('Failed to load item');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this password?')) return;

        setLoading(true);
        try {
            await storage.deleteItem(parseInt(id));
            navigate('/');
        } catch (e) {
            console.error("Error deleting item:", e);
            setError('Failed to delete item');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Encrypt sensitive data
            const dataToEncrypt = JSON.stringify(formData);
            const encrypted = await crypto.encryptData(dataToEncrypt, encryptionKey);

            const item = {
                id: id ? parseInt(id) : Date.now(),
                title: formData.title,
                iv: crypto.bufferToBase64(encrypted.iv.buffer),
                ciphertext: crypto.bufferToBase64(encrypted.ciphertext),
                updatedAt: new Date().toISOString()
            };

            await storage.saveItem(item);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Failed to save password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <Button variant="secondary" onClick={() => navigate('/')} style={{ marginRight: '1rem' }}>
                    &larr; Back
                </Button>
                <h1>{id ? 'Edit Password' : 'Add Password'}</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Google, Facebook"
                        required
                    />
                    <Input
                        label="Username/Email"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="user@example.com"
                    />
                    <Input
                        type="password"
                        label="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Secret password"
                        required
                    />

                    <PasswordGenerator onGenerate={(pwd) => setFormData(prev => ({ ...prev, password: pwd }))} />

                    <Input
                        label="URL"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        placeholder="https://example.com"
                    />
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Notes</label>
                        <textarea
                            className="input"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error}</div>}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Button type="submit" className="btn-block" disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Saving...' : 'Save Password'}
                        </Button>
                        {id && (
                            <Button
                                type="button"
                                variant="danger"
                                onClick={handleDelete}
                                disabled={loading}
                                style={{ backgroundColor: 'var(--color-danger)' }}
                            >
                                Delete
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPassword;
