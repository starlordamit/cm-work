import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Badge, Spin, Drawer } from 'antd';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import {
    DashboardOutlined,
    TeamOutlined,
    UserOutlined,
    LogoutOutlined,
    ExclamationCircleOutlined,
    MenuOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;

const AppLayout = ({ children }) => {
    const { user, role, loading, logout } = useAuth();
    const navigate = useNavigate();
    const [deletionRequestCount, setDeletionRequestCount] = useState(0);
    const [approvalRequestCount, setApprovalRequestCount] = useState(0);
    const [paymentRequestCount, setPaymentRequestCount] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);

    useEffect(() => {
        if (role === 'admin') {
            const unsubscribeDeletionRequests = db.collection('deletionRequests').onSnapshot((snapshot) => {
                setDeletionRequestCount(snapshot.size);
            });

            const unsubscribeApprovalRequests = db.collection('users').where('role', '==', 'new').onSnapshot((snapshot) => {
                setApprovalRequestCount(snapshot.size);
            });

            const unsubscribePaymentRequests = db.collection('videos').where('payment', '==', 'pending').onSnapshot((snapshot) => {
                setPaymentRequestCount(snapshot.size);
            });

            return () => {
                unsubscribeDeletionRequests();
                unsubscribeApprovalRequests();
                unsubscribePaymentRequests();
            };
        }
    }, [role]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const showDrawer = () => {
        setIsDrawerVisible(true);
    };

    const closeDrawer = () => {
        setIsDrawerVisible(false);
    };

    const handleMenuClick = (path) => {
        navigate(path);
        closeDrawer();
    };

    if (loading) {
        return <Spin tip="Loading..." />;
    }

    const menuItems = (
        <>
            <Menu.Item key="1" icon={<DashboardOutlined />} onClick={() => handleMenuClick('/dashboard')}>
                Dashboard
            </Menu.Item>
            {role === 'admin' && (
                <>
                    <Menu.Item key="2" icon={<ExclamationCircleOutlined />} onClick={() => handleMenuClick('/deletion-requests')}>
                        Deletion Requests <Badge count={deletionRequestCount} overflowCount={99} />
                    </Menu.Item>
                    <Menu.Item key="3" icon={<TeamOutlined />} onClick={() => handleMenuClick('/team')}>
                        Team <Badge count={approvalRequestCount} overflowCount={99} />
                    </Menu.Item>
                    <Menu.Item key="6" icon={<TeamOutlined />} onClick={() => handleMenuClick('/payment')}>
                        Payment <Badge count={paymentRequestCount} overflowCount={99} />
                    </Menu.Item>
                </>
            )}
            <Menu.Item key="4" icon={<UserOutlined />} onClick={() => handleMenuClick('/profile')}>
                Profile
            </Menu.Item>
            <Menu.Item key="5" style={{ marginLeft: 'auto' }}>
                <Button type="primary" icon={<LogoutOutlined />} onClick={logout} />
            </Menu.Item>
        </>
    );

    return (
        <Layout className="layout">
            {user && (
                <Header style={styles.header}>
                    <div style={styles.logo}>CMDM</div>
                    <Button
                        type="primary"
                        icon={<MenuOutlined />}
                        onClick={showDrawer}
                        style={isMobile ? styles.mobileMenuButton : { display: 'none' }}
                    >
                        <Badge count={approvalRequestCount + paymentRequestCount} overflowCount={99} />
                    </Button>
                    <div style={isMobile ? styles.mobileMenu : styles.desktopMenu}>
                        <Menu
                            theme="dark"
                            mode={isMobile ? 'vertical' : 'horizontal'}
                            defaultSelectedKeys={['1']}
                            style={styles.menu}
                        >
                            {menuItems}
                        </Menu>
                    </div>
                </Header>
            )}
            <Content style={styles.content}>
                <div className="site-layout-content" style={{ marginTop: '20px' }}>
                    {children}
                </div>
            </Content>
            <Drawer
                title="Menu"
                placement="left"
                onClose={closeDrawer}
                visible={isDrawerVisible}
                style={isMobile ? styles.drawerMenu : null}
            >
                <Menu
                    theme="light"
                    mode="vertical"
                    defaultSelectedKeys={['1']}
                    onClick={() => setIsDrawerVisible(false)}
                >
                    {menuItems}
                </Menu>
            </Drawer>
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
    desktopMenu: {
        display: 'flex',
        flex: 1,
        justifyContent: 'flex-end',
    },
    mobileMenuButton: {
        display: 'block',
    },
    mobileMenu: {
        display: 'none',
    },
    content: {
        padding: '0 20px',
        marginTop: '20px',
    },
    logo: {
        color: '#fff',
        fontSize: '20px',
        fontWeight: 'bold',
    },
    drawerMenu: {
        width: '100%',
    },
    '@media (max-width: 768px)': {
        mobileMenu: {
            display: 'flex',
            flexDirection: 'column',
        },
        desktopMenu: {
            display: 'none',
        },
    },
};

export default AppLayout;
