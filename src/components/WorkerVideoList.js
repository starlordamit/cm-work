import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Card, List } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { db, auth } from '../firebase';
import EditVideoForm from './EditVideoForm';
import AddVideoForm from './AddVideoForm';

const WorkerVideoList = () => {
    const [videos, setVideos] = useState([]);
    const [editingVideo, setEditingVideo] = useState(null);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        if (auth.currentUser) {
            const unsubscribe = db.collection('videos')
                .where('ownerUid', '==', auth.currentUser.uid)
                .onSnapshot((snapshot) => {
                    const videosData = [];
                    snapshot.forEach((doc) => videosData.push({ ...doc.data(), id: doc.id }));
                    setVideos(videosData);
                });

            return () => unsubscribe();
        }

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [auth.currentUser]);

    const requestDeleteVideo = async (video) => {
        if (window.confirm('Are you sure you want to request deletion of this video?')) {
            try {
                await db.collection('videos').doc(video.id).update({
                    deletionPending: true
                });

                await db.collection('deletionRequests').add({
                    videoId: video.id,
                    channel: video.channel,
                    videoLink: video.videoLink,
                    status: video.status,
                    price: video.price,
                    remarks: video.remarks,
                    brand: video.brand,
                    platform: video.platform,
                    contactInfo: video.contactInfo,
                    date: video.date,
                    ownerUid: video.ownerUid,
                    ownerEmail: video.ownerEmail,
                    requestedAt: new Date(),
                });

                message.success('Deletion request sent successfully');
            } catch (error) {
                console.error('Error requesting deletion:', error);
                message.error('Error requesting deletion:', error.message);
            }
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
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <>
                    <Button type="link" icon={<EditOutlined />} onClick={() => setEditingVideo(record)} disabled={record.deletionPending} />
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => requestDeleteVideo(record)} disabled={record.deletionPending} />
                </>
            ),
        },
    ];

    const renderMobileCards = () => (
        <List
            dataSource={videos}
            renderItem={video => (
                <Card key={video.id} style={styles.card}>
                    <p><strong>Channel/Profile:</strong> {video.channel}</p>
                    <p><strong>Video Link:</strong> {video.videoLink}</p>
                    <p><strong>Status:</strong> {video.status}</p>
                    <p><strong>Price:</strong> {video.price}</p>
                    <p><strong>Remarks:</strong> {video.remarks}</p>
                    <p><strong>Brand:</strong> {video.brand}</p>
                    <p><strong>Platform:</strong> {video.platform}</p>
                    <p><strong>Contact Info:</strong> {video.contactInfo}</p>
                    <p><strong>Date:</strong> {video.date}</p>
                    <div style={styles.cardActions}>
                        <Button type="link" icon={<EditOutlined />} onClick={() => setEditingVideo(video)} disabled={video.deletionPending} />
                        <Button type="link" icon={<DeleteOutlined />} onClick={() => requestDeleteVideo(video)} disabled={video.deletionPending} />
                    </div>
                </Card>
            )}
        />
    );

    return (
        <div style={styles.container}>
            <h2>My Videos</h2>
            <Button
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                size="large"
                style={styles.addButton}
                onClick={() => setIsAddModalVisible(true)}
            />
            {isMobile ? renderMobileCards() : (
                <Table dataSource={videos} columns={columns} rowKey="id" />
            )}
            {editingVideo && (
                <Modal
                    title="Edit Video"
                    visible={!!editingVideo}
                    onCancel={() => setEditingVideo(null)}
                    footer={null}
                >
                    <EditVideoForm video={editingVideo} onClose={() => setEditingVideo(null)} />
                </Modal>
            )}
            <Modal
                title="Add New Video"
                visible={isAddModalVisible}
                onCancel={() => setIsAddModalVisible(false)}
                footer={null}
            >
                <AddVideoForm onClose={() => setIsAddModalVisible(false)} />
            </Modal>
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
        marginBottom: '16px',
    },
    cardActions: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    addButton: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
    },
};

export default WorkerVideoList;
