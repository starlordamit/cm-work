import React, { useState, Component } from 'react';
import { Button, message, Typography } from 'antd';
import { auth, googleProvider, db } from '../firebase'; // Import db from your firebase configuration
import { useNavigate } from 'react-router-dom';



const { Title } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const result = await auth.signInWithPopup(googleProvider);
            const user = result.user;

            const userDoc = await db.collection('users').doc(user.uid).get();
            if (!userDoc.exists) {
                await db.collection('users').doc(user.uid).set({
                    email: user.email,
                    name: user.displayName,
                    phone: user.phoneNumber || '',
                    role: 'new',
                    suspended: false,
                });
                message.success('Logged in with Google and new user created');
            } else {
                message.success('Logged in with Google');
            }

            navigate('/dashboard'); // Redirect to the dashboard
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>

            <Button
                type="primary"
                onClick={handleGoogleSignIn}
                loading={loading}
                style={styles.googleButton}
            >
                <img
                    src="https://cdn.iconscout.com/icon/free/png-256/free-google-2719775-2265521.png"
                    alt="Google logo"
                    style={styles.googleLogo}
                />
                Sign in with Google
            </Button>

        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        position: 'relative',
        fontFamily: 'Arial, sans-serif',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url(https://source.unsplash.com/random)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(5px)',
        zIndex: -1,
    },
    overlay: {
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '50px',
        borderRadius: '10px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
    },
    title: {
        marginBottom: '20px',
        color: '#333',
    },
    card: {
        border: 'none',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        padding: '20px',
        background: '#fff',
        borderRadius: '10px',
    },
    googleButton: {
        fontSize: '16px',
        height: '50px',
        backgroundColor: '#4285F4',
        color: '#fff',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '25px',
        transition: 'background-color 0.3s ease, transform 0.3s ease',
    },
    googleButtonHover: {
        backgroundColor: '#357ae8',
        transform: 'scale(1.05)',
    },
    googleLogo: {
        width: '20px',
        height: '20px',
        marginRight: '10px',
    },
};

export default Login;
