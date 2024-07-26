import React, { useState, useEffect } from 'react';
import { Table, message, Card, Tag } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { db } from '../firebase';

const AdminPaymentRequests = () => {
    const [requests, setRequests] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const unsubscribe = db.collection('videos').where('payment', '==', 'pending').onSnapshot((snapshot) => {
            const requestsData = [];
            snapshot.forEach((doc) => requestsData.push({ ...doc.data(), id: doc.id }));
            setRequests(requestsData);
        });

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            unsubscribe();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const approveRequest = async (request) => {
        try {
            await db.collection('videos').doc(request.id).update({ payment: 'done' });
            message.success('Payment request approved successfully');
        } catch (error) {
            console.error('Error approving payment request:', error);
            message.error('Error approving payment request:', error.message);
        }
    };

    const rejectRequest = async (request) => {
        try {
            await db.collection('videos').doc(request.id).update({ payment: 'rejected' });
            message.success('Payment request rejected successfully');
        } catch (error) {
            console.error('Error rejecting payment request:', error);
            message.error('Error rejecting payment request:', error.message);
        }
    };

    const columns = [
        { title: 'Channel/Profile', dataIndex: 'channel', key: 'channel' },
        { title: 'Video Link', dataIndex: 'videoLink', key: 'videoLink', render: (text) => <a href={text} target="_blank" rel="noopener noreferrer">Link</a> },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <Tag color={status === 'pending' ? 'orange' : status === 'done' ? 'green' : 'red'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag> },
        { title: 'Price', dataIndex: 'price', key: 'price' },
        { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
        { title: 'Brand', dataIndex: 'brand', key: 'brand' },
        { title: 'Platform', dataIndex: 'platform', key: 'platform' },
        { title: 'Contact Info', dataIndex: 'contactInfo', key: 'contactInfo' },
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Requested By', dataIndex: 'ownerEmail', key: 'ownerEmail' },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <>
                    <Tag color="green" icon={<CheckOutlined />} onClick={() => approveRequest(record)} style={styles.actionTag}>Approve</Tag>
                    <Tag color="red" icon={<CloseOutlined />} onClick={() => rejectRequest(record)} style={styles.actionTag}>Reject</Tag>
                </>
            ),
        },
    ];

    return (
        <div style={styles.container}>
            <h2>Payment Requests</h2>
            {isMobile ? (
                <div style={styles.cardsContainer}>
                    {requests.map((request) => (
                        <Card key={request.id} style={styles.card}>
                            <p><strong>Channel/Profile:</strong> {request.channel}</p>
                            <p><strong>Video Link:</strong> <a href={request.videoLink} target="_blank" rel="noopener noreferrer">Link</a></p>
                            <p><strong>Status:</strong> <Tag color={request.status === 'pending' ? 'orange' : request.status === 'done' ? 'green' : 'red'}>{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</Tag></p>
                            <p><strong>Price:</strong> {request.price}</p>
                            <p><strong>Remarks:</strong> {request.remarks}</p>
                            <p><strong>Brand:</strong> {request.brand}</p>
                            <p><strong>Platform:</strong> {request.platform}</p>
                            <p><strong>Contact Info:</strong> {request.contactInfo}</p>
                            <p><strong>Date:</strong> {request.date}</p>
                            <p><strong>Requested By:</strong> {request.ownerEmail}</p>
                            <div style={styles.cardActions}>
                                <Tag color="green" icon={<CheckOutlined />} onClick={() => approveRequest(request)} style={styles.actionTag}>Approve</Tag>
                                <Tag color="red" icon={<CloseOutlined />} onClick={() => rejectRequest(request)} style={styles.actionTag}>Reject</Tag>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Table dataSource={requests} columns={columns} rowKey="id" />
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
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

export default AdminPaymentRequests;
