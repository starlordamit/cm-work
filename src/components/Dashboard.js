import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Spin, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import useAuth from './useAuth';
import AdminVideoList from './AdminVideoList';
import WorkerVideoList from './WorkerVideoList';
import {
    DashboardOutlined,
    TeamOutlined,
    UserOutlined,
    LogoutOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

const Dashboard = () => {
    const { user, role, loading, setUser, setRole } = useAuth();
    const navigate = useNavigate();
    const [deletionRequestCount, setDeletionRequestCount] = useState(0);
    const [approvalRequestCount, setApprovalRequestCount] = useState(0);
    const [suspended, setSuspended] = useState(false);

    useEffect(() => {
        if (role === 'admin') {
            const unsubscribeDeletionRequests = db.collection('deletionRequests').onSnapshot((snapshot) => {
                setDeletionRequestCount(snapshot.size);
            });

            const unsubscribeApprovalRequests = db.collection('users').where('role', '==', 'new').onSnapshot((snapshot) => {
                setApprovalRequestCount(snapshot.size);
            });

            return () => {
                unsubscribeDeletionRequests();
                unsubscribeApprovalRequests();
            };
        }
    }, [role]);

    useEffect(() => {
        if (user) {
            const unsubscribeUserStatus = db.collection('users').doc(user.uid).onSnapshot((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    setSuspended(userData.suspended);
                }
            });

            return () => unsubscribeUserStatus();
        }
    }, [user]);

    const handleLogout = async () => {
        await auth.signOut();
        setUser(null);
        setRole('');
        navigate('/login'); // Redirect to login page
    };

    if (loading) {
        return <Spin tip="Loading..." />;
    }

    return (
        <Layout style={styles.layout}>

            <Content style={styles.content}>
                <div style={styles.contentInner}>
                    {role === 'admin' ? (
                        <AdminVideoList />
                    ) : suspended ? (
                        <div>
                            <h2>Suspended</h2>
                            <p>Your account has been suspended. Please contact the admin for more details.</p>
                        </div>
                    ) : role === 'worker' ? (
                        <WorkerVideoList />
                    ) : role === 'new' ? (
                        <div>
                            <h2>Approval Pending</h2>
                            <p>Your request has been sent for approval. Please wait for an admin to approve your account.</p>
                        </div>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
            </Content>
            <Footer style={styles.footer}>Creators Mela ©2024</Footer>
        </Layout>
    );
};

const styles = {
    layout: {
        // minHeight: '100vh',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#001529',
        // padding: '0 20px',
    },
    logo: {
        color: '#fff',
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    menu: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
    },
    logout: {
        marginLeft: 'auto',
    },
    content: {
        // padding: '0 20px',
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentInner: {
        width: '100%',
        // maxWidth: '800px',
    },
    footer: {
        textAlign: 'center',
    },
};

export default Dashboard;
