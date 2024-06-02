import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Badge, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import {
    DashboardOutlined,
    TeamOutlined,
    UserOutlined,
    LogoutOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

const AppLayout = ({ children }) => {
    const { user, role, loading, logout } = useAuth();
    const navigate = useNavigate();
    const [deletionRequestCount, setDeletionRequestCount] = useState(0);
    const [approvalRequestCount, setApprovalRequestCount] = useState(0);

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

    if (loading) {
        return <Spin tip="Loading..." />;
    }

    return (
        <Layout className="layout">
            {user && (
                <Header style={styles.header}>
                    <div className="logo"/>
                    {/*<div style={styles.logo}>CreatorsMela</div>*/}
                    <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} style={styles.menu}>
                        <Menu.Item key="1" icon={<DashboardOutlined/>} onClick={() => navigate('/dashboard')}>
                            Dashboard
                        </Menu.Item>
                        {role === 'admin' && (
                            <>
                                <Menu.Item key="2" icon={<ExclamationCircleOutlined/>}
                                           onClick={() => navigate('/deletion-requests')}>
                                    Deletion Requests <Badge count={deletionRequestCount} overflowCount={99}/>
                                </Menu.Item>
                                <Menu.Item key="3" icon={<TeamOutlined/>} onClick={() => navigate('/team')}>
                                    Team <Badge count={approvalRequestCount} overflowCount={99}/>
                                </Menu.Item>
                            </>
                        )}
                        <Menu.Item key="4" icon={<UserOutlined/>} onClick={() => navigate('/profile')}>
                            Profile
                        </Menu.Item>
                        <Menu.Item key="5" style={{marginLeft: 'auto'}}>
                            <Button type="primary" icon={<LogoutOutlined/>} onClick={logout}/>
                        </Menu.Item>
                    </Menu>
                </Header>
            )}
            <Content style={styles.content}>
                <div className="site-layout-content" style={{ marginTop: '20px' }}>
                    {children}
                </div>
            </Content>
            {/*<Footer style={styles.footer}>Creators Mela ©2024</Footer>*/}
        </Layout>
    );
};

const styles = {
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#001529',
        padding: '0 20px',
    },
    menu: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
    },
    content: {
        padding: '0 20px',
        marginTop: '20px',
    },
    footer: {
        textAlign: 'center',
    },
    logo: {
        color: '#fff',
        fontSize: '20px',
        fontWeight: 'bold',
        padding: ' 2px',
    },
};

export default AppLayout;
