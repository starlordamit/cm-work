import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, message, Input, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { db } from '../firebase';
import EditVideoForm from './EditVideoForm';
import AddVideoForm from './AddVideoForm';

const AdminVideoList = () => {
    const [videos, setVideos] = useState([]);
    const [editingVideo, setEditingVideo] = useState(null);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const unsubscribe = db.collection('videos').onSnapshot((snapshot) => {
            const videosData = [];
            snapshot.forEach((doc) => videosData.push({ ...doc.data(), id: doc.id }));
            setVideos(videosData);
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

    const deleteVideo = async (id) => {
        if (window.confirm('Are you sure you want to delete this video?')) {
            try {
                await db.collection('videos').doc(id).delete();
                message.success('Video deleted successfully');
            } catch (error) {
                message.error('Error deleting video:', error.message);
            }
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
                    icon="search"
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
            <span role="img" aria-label="filter" className="anticon anticon-search">
                🔍
            </span>
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

    const getStatusFilterProps = () => ({
        filters: [
            { text: 'Pending', value: 'pending' },
            { text: 'Live', value: 'live' },
            { text: 'Cancel', value: 'cancel' },
        ],
        onFilter: (value, record) => record.status === value,
    });

    const getPlatformFilterProps = () => ({
        filters: [
            { text: 'YouTube', value: 'youtube' },
            { text: 'Instagram', value: 'instagram' },
            { text: 'Other', value: 'other' },
        ],
        onFilter: (value, record) => record.platform === value,
    });

    const columns = [
        { title: 'Channel/Profile', dataIndex: 'channel', key: 'channel', ...getColumnSearchProps('channel') },
        { title: 'Video Link', dataIndex: 'videoLink', key: 'videoLink', ...getColumnSearchProps('videoLink') },
        { title: 'Status', dataIndex: 'status', key: 'status', ...getStatusFilterProps() },
        { title: 'Price', dataIndex: 'price', key: 'price', ...getColumnSearchProps('price') },
        { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', ...getColumnSearchProps('remarks') },
        { title: 'Brand', dataIndex: 'brand', key: 'brand', ...getColumnSearchProps('brand') },
        { title: 'Platform', dataIndex: 'platform', key: 'platform', ...getPlatformFilterProps() },
        { title: 'Contact Info', dataIndex: 'contactInfo', key: 'contactInfo', ...getColumnSearchProps('contactInfo') },
        { title: 'Date', dataIndex: 'date', key: 'date', ...getColumnSearchProps('date') },
        { title: 'Added By', dataIndex: 'ownerEmail', key: 'ownerEmail', ...getColumnSearchProps('ownerEmail') },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <>
                    <Button type="link" icon={<EditOutlined />} onClick={() => setEditingVideo(record)} />
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => deleteVideo(record.id)} />
                </>
            ),
        },
    ];

    return (
        <div style={styles.container}>
            <Button
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                size="large"
                style={styles.addButton}
                onClick={() => setIsAddModalVisible(true)}
            />
            {isMobile ? (
                <div style={styles.cardsContainer}>
                    {videos.map((video) => (
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
                            <p><strong>Added By:</strong> {video.ownerEmail}</p>
                            <div style={styles.cardActions}>
                                <Button type="link" icon={<EditOutlined />} onClick={() => setEditingVideo(video)} />
                                <Button type="link" icon={<DeleteOutlined />} onClick={() => deleteVideo(video.id)} />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <Table dataSource={videos} columns={columns} rowKey="id" />
                </div>
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
        minHeight: 'calc(100vh - 134px)', // Adjusting for header and footer height
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
    addButton: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
    },
};

export default AdminVideoList;
