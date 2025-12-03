import React, { createContext, useContext, useState, useEffect } from 'react';
import * as crypto from '../services/crypto';
import { auth } from '../firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [encryptionKey, setEncryptionKey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [needsMasterPassword, setNeedsMasterPassword] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setEncryptionKey(null);
                setNeedsMasterPassword(false);
            } else if (!encryptionKey) {
                // User is authenticated but we don't have the encryption key
                // This happens on page reload or new device login
                setNeedsMasterPassword(true);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, [encryptionKey]);

    const signup = async (email, password, masterPassword) => {
        // 1. Create Firebase User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // 2. Derive Encryption Key from Master Password using email as salt
        const { key } = await crypto.deriveKey(masterPassword, email);

        setEncryptionKey(key);
        setNeedsMasterPassword(false);
        return userCredential.user;
    };

    const login = async (email, password, masterPassword) => {
        // 1. Login with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // 2. Derive Key using email as salt for consistency across devices
        const { key } = await crypto.deriveKey(masterPassword, email);
        setEncryptionKey(key);
        setNeedsMasterPassword(false);
        return userCredential.user;
    };

    const unlockVault = async (masterPassword) => {
        if (!user) throw new Error("Not authenticated");

        const { key } = await crypto.deriveKey(masterPassword, user.email);
        setEncryptionKey(key);
        setNeedsMasterPassword(false);
    };

    const logout = async () => {
        await signOut(auth);
        setEncryptionKey(null);
        setNeedsMasterPassword(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            encryptionKey,
            signup,
            login,
            logout,
            unlockVault,
            needsMasterPassword,
            loading
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
