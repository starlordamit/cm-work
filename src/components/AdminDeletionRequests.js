import React, { useState, useEffect } from 'react';
import { Table, Button, message, Card } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { db } from '../firebase';

const AdminDeletionRequests = () => {
    const [requests, setRequests] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const unsubscribe = db.collection('deletionRequests').onSnapshot((snapshot) => {
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
            // Delete the video
            await db.collection('videos').doc(request.videoId).delete();
            // Delete the deletion request
            await db.collection('deletionRequests').doc(request.id).delete();
            message.success('Deletion request approved and video deleted successfully');
        } catch (error) {
            console.error('Error approving deletion request:', error);
            message.error('Error approving deletion request:', error.message);
        }
    };

    const rejectRequest = async (request) => {
        try {
            // Clear the deletionPending flag on the video document
            await db.collection('videos').doc(request.videoId).update({
                deletionPending: false
            });
            // Delete the deletion request
            await db.collection('deletionRequests').doc(request.id).delete();
            message.success('Deletion request rejected successfully');
        } catch (error) {
            console.error('Error rejecting deletion request:', error);
            message.error('Error rejecting deletion request:', error.message);
        }
    };

    const columns = [
        { title: 'Channel/Profile', dataIndex: 'channel', key: 'channel' },
        { title: 'Video Link', dataIndex: 'videoLink', key: 'videoLink' },
        { title: 'Status', dataIndex: 'status', key: 'status' },
        { title: 'Price', dataIndex: 'price', key: 'price' },
        { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
        { title: 'Brand', dataIndex: 'brand', key: 'brand' },
        { title: 'Platform', dataIndex: 'platform', key: 'platform' },
        { title: 'Contact Info', dataIndex: 'contactInfo', key: 'contactInfo' },
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Requested By', dataIndex: 'ownerEmail', key: 'ownerEmail' },
        { title: 'Requested At', dataIndex: 'requestedAt', key: 'requestedAt', render: (text) => new Date(text.seconds * 1000).toLocaleString() },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <>
                    <Button type="link" icon={<CheckOutlined />} onClick={() => approveRequest(record)} />
                    <Button type="link" icon={<CloseOutlined />} onClick={() => rejectRequest(record)} />
                </>
            ),
        },
    ];

    return (
        <div style={styles.container}>
            <h2>Deletion Requests</h2>
            {isMobile ? (
                <div style={styles.cardsContainer}>
                    {requests.map((request) => (
                        <Card key={request.id} style={styles.card}>
                            <p><strong>Channel/Profile:</strong> {request.channel}</p>
                            <p><strong>Video Link:</strong> {request.videoLink}</p>
                            <p><strong>Status:</strong> {request.status}</p>
                            <p><strong>Price:</strong> {request.price}</p>
                            <p><strong>Remarks:</strong> {request.remarks}</p>
                            <p><strong>Brand:</strong> {request.brand}</p>
                            <p><strong>Platform:</strong> {request.platform}</p>
                            <p><strong>Contact Info:</strong> {request.contactInfo}</p>
                            <p><strong>Date:</strong> {request.date}</p>
                            <p><strong>Requested By:</strong> {request.ownerEmail}</p>
                            <p><strong>Requested At:</strong> {new Date(request.requestedAt.seconds * 1000).toLocaleString()}</p>
                            <div style={styles.cardActions}>
                                <Button type="link" icon={<CheckOutlined />} onClick={() => approveRequest(request)} />
                                <Button type="link" icon={<CloseOutlined />} onClick={() => rejectRequest(request)} />
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
        // minHeight: 'calc(100vh - 134px)', // Adjusting for header and footer height
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
};

export default AdminDeletionRequests;
