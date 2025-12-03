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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setEncryptionKey(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signup = async (email, password, masterPassword) => {
        // 1. Create Firebase User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // 2. Derive Encryption Key from Master Password using email as salt
        // This ensures the same key is derived on any device when logging in
        const { key } = await crypto.deriveKey(masterPassword, email);

        setEncryptionKey(key);
        return userCredential.user;
    };

    const login = async (email, password, masterPassword) => {
        // 1. Login with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // 2. Derive Key (We need the salt! For now assuming fixed salt or we fetch it)
        // TODO: In a real app, we fetch the unique salt for this user from Firestore.
        // To keep it simple for this migration, we will use a deterministic salt based on email (less secure but functional for now)
        // or we just re-use the deriveKey logic which generates a new salt, but that won't match previous encryption.

        // FIX: We need to store the salt. Let's assume we use the email as salt for now to ensure consistency across devices without extra DB calls yet.
        // Ideally, we save the salt in a 'users' collection.

        const { key } = await crypto.deriveKey(masterPassword, email); // Using email as salt for simplicity in this step
        setEncryptionKey(key);
        return userCredential.user;
    };

    const logout = async () => {
        await signOut(auth);
        setEncryptionKey(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            encryptionKey,
            signup,
            login,
            logout,
            loading
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
