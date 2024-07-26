import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, message, Spin, Popconfirm, Input, Card, Tag } from 'antd';
import { CheckOutlined, StopOutlined, ReloadOutlined, DeleteOutlined, SearchOutlined, MailOutlined } from '@ant-design/icons';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import firebase from 'firebase/compat/app';

const Team = () => {
    const { role, loading: authLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        if (role === 'admin') {
            const unsubscribe = db.collection('users').onSnapshot(async (snapshot) => {
                const usersData = [];
                for (let doc of snapshot.docs) {
                    const userData = doc.data();
                    const videosSnapshot = await db.collection('videos').where('ownerUid', '==', doc.id).get();
                    usersData.push({
                        ...userData,
                        id: doc.id,
                        email: userData.email || '',
                        name: userData.name || '',
                        phone: userData.phone || '',
                        videoCount: videosSnapshot.size,
                        suspended: userData.suspended || false,
                    });
                }
                setUsers(usersData);
                setLoading(false);
            });

            const handleResize = () => {
                setIsMobile(window.innerWidth <= 768);
            };

            window.addEventListener('resize', handleResize);

            return () => {
                unsubscribe();
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [role]);

    const handleApprove = async (userId) => {
        try {
            await db.collection('users').doc(userId).update({ role: 'worker', approved: true });
            message.success('User approved successfully');
        } catch (error) {
            message.error('Failed to approve user');
        }
    };

    const handleSuspend = async (userId) => {
        try {
            await db.collection('users').doc(userId).update({ suspended: true });
            message.success('User suspended successfully');
        } catch (error) {
            message.error('Failed to suspend user');
        }
    };

    const handleReactivate = async (userId) => {
        try {
            await db.collection('users').doc(userId).update({ suspended: false });
            message.success('User reactivated successfully');
        } catch (error) {
            message.error('Failed to reactivate user');
        }
    };

    const handleDelete = async (userId) => {
        try {
            // Delete user from Firestore
            await db.collection('users').doc(userId).delete();
            // Delete user from Firebase Authentication
            const userToDelete = await firebase.auth().getUser(userId);
            if (userToDelete) {
                await firebase.auth().deleteUser(userId);
            }
            message.success('User deleted successfully');
        } catch (error) {
            message.error('Failed to delete user');
        }
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Button
                    type="primary"
                    onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    icon={<SearchOutlined />}
                    size="small"
                    style={{ width: 90, marginRight: 8 }}
                >
                    Search
                </Button>
                <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                    Reset
                </Button>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current.select(), 100);
            }
        },
        render: (text) => text,
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name', ...getColumnSearchProps('name') },
        { title: 'Email', dataIndex: 'email', key: 'email', ...getColumnSearchProps('email') },
        { title: 'Phone', dataIndex: 'phone', key: 'phone', ...getColumnSearchProps('phone') },
        { title: 'Role', dataIndex: 'role', key: 'role' },
        { title: 'Videos Done', dataIndex: 'videoCount', key: 'videoCount' },
        { title: 'Status', dataIndex: 'suspended', key: 'suspended', render: (text) => (text ? 'Suspended' : 'Active') },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <>
                    {record.role === 'new' && (
                        <Tag color="blue" onClick={() => handleApprove(record.id)} style={styles.actionTag}>
                            Approve
                        </Tag>
                    )}
                    {!record.suspended && record.role !== 'new' && (
                        <Tag color="orange" onClick={() => handleSuspend(record.id)} style={styles.actionTag}>
                            Suspend
                        </Tag>
                    )}
                    {record.suspended && (
                        <Tag color="green" onClick={() => handleReactivate(record.id)} style={styles.actionTag}>
                            Reactivate
                        </Tag>
                    )}
                    <Popconfirm
                        title="Are you sure delete this user?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tag color="red" style={styles.actionTag}>Delete</Tag>
                    </Popconfirm>
                </>
            ),
        },
    ];

    if (authLoading || loading) {
        return <Spin tip="Loading..." />;
    }

    return (
        <div style={styles.container}>
            <h2>Team</h2>
            {isMobile ? (
                <div style={styles.cardsContainer}>
                    {users.map((user) => (
                        <Card key={user.id} style={styles.card}>
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Phone:</strong> {user.phone}</p>
                            <p><strong>Role:</strong> {user.role}</p>
                            <p><strong>Videos Done:</strong> {user.videoCount}</p>
                            <p><strong>Status:</strong> {user.suspended ? 'Suspended' : 'Active'}</p>
                            <div style={styles.cardActions}>
                                {user.role === 'new' && (
                                    <Tag color="blue" onClick={() => handleApprove(user.id)} style={styles.actionTag}>
                                        Approve
                                    </Tag>
                                )}
                                {!user.suspended && user.role !== 'new' && (
                                    <Tag color="orange" onClick={() => handleSuspend(user.id)} style={styles.actionTag}>
                                        Suspend
                                    </Tag>
                                )}
                                {user.suspended && (
                                    <Tag color="green" onClick={() => handleReactivate(user.id)} style={styles.actionTag}>
                                        Reactivate
                                    </Tag>
                                )}
                                <Popconfirm
                                    title="Are you sure delete this user?"
                                    onConfirm={() => handleDelete(user.id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Tag color="red" style={styles.actionTag}>Delete</Tag>
                                </Popconfirm>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Table dataSource={users} columns={columns} rowKey="id" loading={loading} />
            )}
        </div>
    );
};

const styles = {
    container: {
     // Adjusting for header and footer height
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    cardsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    card: {
        width: '100%',
    },
    cardActions: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    actionTag: {
        cursor: 'pointer',
    },
};

export default Team;
