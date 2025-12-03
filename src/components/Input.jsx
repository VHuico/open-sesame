import React from 'react';

const Input = ({ label, error, className = '', type = 'text', ...props }) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={`input-group ${className}`} style={{ marginBottom: '1rem' }}>
            {label && (
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    {label}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                <input
                    className="input"
                    type={inputType}
                    {...props}
                    style={isPassword ? { paddingRight: '2.5rem' } : {}}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '0.5rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-muted)',
                            padding: '0.25rem',
                            fontSize: '1.2rem',
                            lineHeight: 1
                        }}
                        tabIndex="-1"
                        title={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                )}
            </div>
            {error && (
                <span style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {error}
                </span>
            )}
        </div>
    );
};

export default Input;
