import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, getUserRole } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUser(user);
                const userRole = await getUserRole(user.uid);
                setRole(userRole);
            } else {
                setUser(null);
                setRole('');
            }
            setLoading(false);
        });

        return () => unsubscribeAuth();
    }, []);

    const logout = async () => {
        await auth.signOut();
        setUser(null);
        setRole('');
    };

    const value = {
        user,
        role,
        loading,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
