import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Card, Input, Tag, Typography, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MailOutlined, CopyOutlined, SearchOutlined, FilterOutlined, EyeOutlined } from '@ant-design/icons';
import { db, auth } from '../firebase';
import EditVideoForm from './EditVideoForm';
import AddVideoForm from './AddVideoForm';

const { Option } = Select;

const WorkerVideoList = () => {
    const [videos, setVideos] = useState([]);
    const [editingVideo, setEditingVideo] = useState(null);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isMailModalVisible, setIsMailModalVisible] = useState(false);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [viewVideoDetails, setViewVideoDetails] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [mailTemplate, setMailTemplate] = useState('');
    const [subject, setSubject] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [dateSortOrder, setDateSortOrder] = useState(null);
    const [paymentFilter, setPaymentFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);

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
    }, [auth.currentUser]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const handleSortChange = (value) => {
        setDateSortOrder(value);
    };

    const handlePaymentFilterChange = (value) => {
        setPaymentFilter(value);
    };

    const handleStatusFilterChange = (value) => {
        setStatusFilter(value);
    };

    const resetAllFilters = () => {
        setSearchText('');
        setDateSortOrder(null);
        setPaymentFilter(null);
        setStatusFilter(null);
    };

    const filteredVideos = videos
        .filter(video => video.channel.toLowerCase().includes(searchText.toLowerCase()))
        .filter(video => !paymentFilter || video.payment === paymentFilter)
        .filter(video => !statusFilter || video.status === statusFilter)
        .sort((a, b) => {
            if (!dateSortOrder) return 0;
            return dateSortOrder === 'ascend' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
        });

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
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
    });

    const showMailModal = (video) => {
        setCurrentVideo(video);
        setSubject(`Collaboration Confirmation Mail | CreatorsMela`);
        setMailTemplate(`Hey,
I hope this email finds you well.
We are excited to collaborate with you for an ${video.platform} Promotion Deal
for the ${video.brand} with ${video.channel}

Deliverables -

1. Payment and Video Publishing:
      - This Deal is Closed at a total Amount of INR ${video.price}/-
      - 100% of the Total Payment will be Paid after Video Approval & Before Publishing.
      - If the video is Private/Deleted Before 30 days, you must refund the full payment to us.
      - Removing the Link from Bio isn't Allowed Before 7 Days.
      - If you fail to publish the video on time, after receiving the payment, you must refund the full payment you received.

2. Document Submission:
      - Please provide a copy of your Aadhaar card, PAN card, and Bank details for
        payment processing and verification.

Please Confirm your acceptance of these terms by replying to this email and attaching the required documents. Once we receive your confirmation and documents, we will proceed with the payment.

Feel Free to Contact us regarding any issue or queries.

Looking forward to a successful collaboration!

Thank you,
`);
        setIsMailModalVisible(true);
    };

    const handleCopyToClipboard = (text) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                message.success('Copied to clipboard');
            }).catch((error) => {
                message.error('Failed to copy to clipboard');
            });
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.width = '2em';
            textArea.style.height = '2em';
            textArea.style.padding = '0';
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';
            textArea.style.background = 'transparent';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    message.success('Copied to clipboard');
                } else {
                    message.error('Failed to copy to clipboard');
                }
            } catch (err) {
                message.error('Failed to copy to clipboard');
            }
            document.body.removeChild(textArea);
        }
    };

    const getStatusTag = (status) => {
        let color;
        switch (status) {
            case 'pending':
                color = 'orange';
                break;
            case 'live':
                color = 'green';
                break;
            case 'cancel':
                color = 'red';
                break;
            default:
                color = 'gray';
        }
        return <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
    };

    const getPaymentTag = (payment) => {
        let color;
        switch (payment) {
            case 'done':
                color = 'green';
                break;
            case 'rejected':
                color = 'red';
                break;
            default:
                color = 'gray';
        }
        return <Tag color={color}>{payment.charAt(0).toUpperCase() + payment.slice(1)}</Tag>;
    };

    const columns = [
        { title: 'Channel/Profile', dataIndex: 'channel', key: 'channel', ...getColumnSearchProps('channel'), width: 100 },
        { title: 'Actions', key: 'actions', width: 100, render: (text, record) => (
            <>
                <Button type="link" icon={<EyeOutlined />} onClick={() => setViewVideoDetails(record)} />
                <Button type="link" icon={<EditOutlined />} onClick={() => setEditingVideo(record)} disabled={record.deletionPending || record.payment === 'done'} />
                <Button type="link" icon={<DeleteOutlined />} onClick={() => requestDeleteVideo(record)} disabled={record.deletionPending || record.payment === 'done'} />
                <Button type="link" icon={<MailOutlined />} onClick={() => showMailModal(record)} />
            </>
        ) },
    ];

    const fullColumns = [
        { title: 'Channel/Profile', dataIndex: 'channel', key: 'channel', ...getColumnSearchProps('channel'), fixed: 'left', width: 150 },
        { title: 'Video Link', dataIndex: 'videoLink', key: 'videoLink', render: (text) => <a href={text} target="_blank" rel="noopener noreferrer">Link</a>, fixed: 'left', width: 150 },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => getStatusTag(status) },
        { title: 'Price', dataIndex: 'price', key: 'price' },
        { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
        { title: 'Brand', dataIndex: 'brand', key: 'brand' },
        { title: 'Platform', dataIndex: 'platform', key: 'platform' },
        { title: 'Contact Info', dataIndex: 'contactInfo', key: 'contactInfo' },
        { title: 'Date', dataIndex: 'date', key: 'date', sorter: (a, b) => new Date(a.date) - new Date(b.date) },
        { title: 'Payment Status', dataIndex: 'payment', key: 'payment', render: (payment) => getPaymentTag(payment) },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 150,
            render: (text, record) => (
                <>
                    <Button type="link" icon={<EditOutlined />} onClick={() => setEditingVideo(record)} disabled={record.deletionPending || record.payment === 'done'} />
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => requestDeleteVideo(record)} disabled={record.deletionPending || record.payment === 'done'} />
                    <Button type="link" icon={<MailOutlined />} onClick={() => showMailModal(record)} />
                </>
            ),
        },
    ];

    const renderMobileCards = () => (
        <div style={styles.cardsContainer}>
            {filteredVideos.map((video) => (
                <Card key={video.id} style={styles.card}>
                    <div style={styles.statusDot}>
                        {getStatusTag(video.status)}
                        <Tag color={video.payment === 'pending' ? 'grey' : video.payment === 'rejected' ? 'red' : 'green'}>{video.price} INR</Tag>
                    </div>
                    <Typography><strong>Channel/Profile:</strong> {video.channel} </Typography>
                    <div style={styles.cardActions}>
                        <Button type="link" icon={<EyeOutlined />} onClick={() => setViewVideoDetails(video)} />
                        <Button type="link" icon={<EditOutlined />} onClick={() => setEditingVideo(video)} disabled={video.deletionPending || video.payment === 'done'} />
                        <Button type="link" icon={<DeleteOutlined />} onClick={() => requestDeleteVideo(video)} disabled={video.deletionPending || video.payment === 'done'} />
                        <Button type="link" icon={<MailOutlined />} onClick={() => showMailModal(video)} />
                    </div>
                </Card>
            ))}
        </div>
    );

    return (
        <div style={styles.container}>
            <h2>My Videos</h2>
            {isMobile ? (
                <>
                    <Button type="primary" icon={<FilterOutlined />} onClick={() => setFiltersVisible(!filtersVisible)} style={styles.filterButton}>
                        Filters
                    </Button>
                    {filtersVisible && (
                        <div style={styles.filtersContainer}>
                            <Input
                                placeholder="Search Channel/Profile"
                                value={searchText}
                                onChange={handleSearchChange}
                                style={styles.searchInput}
                            />
                            <Select
                                placeholder="Sort by Date"
                                value={dateSortOrder}
                                onChange={handleSortChange}
                                style={styles.filterSelect}
                            >
                                <Option value="ascend">Ascending</Option>
                                <Option value="descend">Descending</Option>
                            </Select>
                            <Select
                                placeholder="Filter by Payment"
                                value={paymentFilter}
                                onChange={handlePaymentFilterChange}
                                style={styles.filterSelect}
                            >
                                <Option value="pending">Pending</Option>
                                <Option value="done">Done</Option>
                                <Option value="rejected">Rejected</Option>
                            </Select>
                            <Select
                                placeholder="Filter by Status"
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
                                style={styles.filterSelect}
                            >
                                <Option value="pending">Pending</Option>
                                <Option value="live">Live</Option>
                                <Option value="cancel">Cancel</Option>
                            </Select>
                            <Button onClick={resetAllFilters} style={styles.resetButton}>Reset All Filters</Button>
                        </div>
                    )}
                    {renderMobileCards()}
                </>
            ) : (
                <>
                    <Input
                        placeholder="Search Channel/Profile"
                        value={searchText}
                        onChange={handleSearchChange}
                        style={styles.searchInput}
                    />
                    <Table
                        dataSource={filteredVideos}
                        columns={fullColumns}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 1500, y: 600 }}
                    />
                </>
            )}
            <Button
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                size="large"
                style={styles.addButton}
                onClick={() => setIsAddModalVisible(true)}
            />
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
            <Modal
                title="Confirmation Mail"
                visible={isMailModalVisible}
                onCancel={() => setIsMailModalVisible(false)}
                footer={[
                    <Button key="copySubject" icon={<CopyOutlined />} onClick={() => handleCopyToClipboard(subject)}>
                        Copy Subject
                    </Button>,
                    <Button key="copyBody" icon={<CopyOutlined />} onClick={() => handleCopyToClipboard(mailTemplate)}>
                        Copy Body
                    </Button>,
                    <Button key="close" onClick={() => setIsMailModalVisible(false)}>
                        Close
                    </Button>,
                ]}
            >
                <div style={styles.mailTemplateContainer}>
                    <p><strong>Subject:</strong> {subject}</p>
                    <pre style={styles.mailTemplate}>{mailTemplate}</pre>
                </div>
            </Modal>
            {viewVideoDetails && (
                <Modal
                    title="Video Details"
                    visible={!!viewVideoDetails}
                    onCancel={() => setViewVideoDetails(null)}
                    footer={null}
                >
                    <div style={styles.videoDetailsContainer}>
                        <Typography><strong>Channel/Profile:</strong> {viewVideoDetails.channel}</Typography>
                        <Typography><strong>Video Link:</strong> <a href={viewVideoDetails.videoLink} target="_blank" rel="noopener noreferrer">Link</a></Typography>
                        <Typography><strong>Status:</strong> {getStatusTag(viewVideoDetails.status)}</Typography>
                        <Typography><strong>Price:</strong> {viewVideoDetails.price}</Typography>
                        <Typography><strong>Remarks:</strong> {viewVideoDetails.remarks}</Typography>
                        <Typography><strong>Brand:</strong> {viewVideoDetails.brand}</Typography>
                        <Typography><strong>Platform:</strong> {viewVideoDetails.platform}</Typography>
                        <Typography><strong>Contact Info:</strong> {viewVideoDetails.contactInfo}</Typography>
                        <Typography><strong>Date:</strong> {viewVideoDetails.date}</Typography>
                        <Typography><strong>Payment Status:</strong> {getPaymentTag(viewVideoDetails.payment)}</Typography>
                    </div>
                </Modal>
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
        marginBottom: '16px',
    },
    cardActions: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    statusDot: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px',
    },
    addButton: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
    },
    mailTemplateContainer: {
        maxHeight: '400px',
        overflowY: 'auto',
    },
    mailTemplate: {
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
    },
    filtersContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '16px',
    },
    searchInput: {
        marginBottom: '8px',
    },
    filterSelect: {
        width: '100%',
    },
    filterButton: {
        marginBottom: '16px',
    },
    resetButton: {
        marginTop: '8px',
    },
    videoDetailsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
};

export default WorkerVideoList;
