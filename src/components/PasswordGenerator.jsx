import React, { useState } from 'react';
import Button from './Button';

const PasswordGenerator = ({ onGenerate }) => {
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
    });

    const generate = () => {
        const charset = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
        };

        let chars = '';
        if (options.uppercase) chars += charset.uppercase;
        if (options.lowercase) chars += charset.lowercase;
        if (options.numbers) chars += charset.numbers;
        if (options.symbols) chars += charset.symbols;

        if (chars === '') return;

        let password = '';
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            password += chars[array[i] % chars.length];
        }

        onGenerate(password);
    };

    return (
        <div className="card" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--color-bg)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Password Generator</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Length: {length}</label>
                    <input
                        type="range"
                        min="8"
                        max="64"
                        value={length}
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </div>
                <Button onClick={generate} type="button" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    Generate
                </Button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {Object.keys(options).map(key => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={options[key]}
                            onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                        />
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                ))}
            </div>
        </div>
    );
};

export default PasswordGenerator;
