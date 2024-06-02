import { useState, useEffect } from 'react';
import { auth, getUserRole } from '../firebase';

const useAuth = () => {
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

    return { user, role, loading, setUser, setRole };
};

export default useAuth;
