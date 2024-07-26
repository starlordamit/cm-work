import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, message, Input, Card, Select, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined, MailOutlined, CopyOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { db } from '../firebase';
import EditVideoForm from './EditVideoForm';
import AddVideoForm from './AddVideoForm';

const { Option } = Select;

const AdminVideoList = () => {
    const [videos, setVideos] = useState([]);
    const [editingVideo, setEditingVideo] = useState(null);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [teamFilter, setTeamFilter] = useState('');
    const [dateSortOrder, setDateSortOrder] = useState(null);
    const [paymentFilter, setPaymentFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [viewVideoDetails, setViewVideoDetails] = useState(null);
    const [isMailModalVisible, setIsMailModalVisible] = useState(false);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [mailTemplate, setMailTemplate] = useState('');
    const [subject, setSubject] = useState('');

    const searchInput = useRef(null);

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

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
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

    const handleTeamFilterChange = (value) => {
        setTeamFilter(value);
    };

    const resetAllFilters = () => {
        setSearchText('');
        setSearchedColumn('');
        setDateSortOrder(null);
        setPaymentFilter('');
        setStatusFilter('');
        setTeamFilter('');
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

    const columns = [
        { title: 'Channel/Profile', dataIndex: 'channel', key: 'channel', ...getColumnSearchProps('channel'), width: 150 },
        { title: 'Actions', key: 'actions', width: 100, render: (text, record) => (
            <>
                <Button type="link" icon={<EyeOutlined />} onClick={() => setViewVideoDetails(record)} />
                <Button type="link" icon={<EditOutlined />} onClick={() => setEditingVideo(record)} />
                <Button type="link" icon={<DeleteOutlined />} onClick={() => deleteVideo(record.id)} />
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
        { title: 'Added By', dataIndex: 'ownerEmail', key: 'ownerEmail' },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 150,
            render: (text, record) => (
                <>
                   
                    <Button type="link" icon={<EditOutlined />} onClick={() => setEditingVideo(record)} />
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => deleteVideo(record.id)} />
                    <Button type="link" icon={<MailOutlined />} onClick={() => showMailModal(record)} />
                </>
            ),
        },
    ];

    const renderMobileCards = () => (
        <div style={styles.cardsContainer}>
            {videos.map((video) => (
                <Card key={video.id} style={styles.card}>
                    <div style={styles.statusDot}>
                        {getStatusTag(video.status)}
                        <Tag color={video.payment === 'pending' ? 'grey' : video.payment === 'rejected' ? 'red' : 'green'}>{video.price} INR</Tag>
                    </div>
                    <Typography><strong>Channel/Profile:</strong> {video.channel} </Typography>
                    <div style={styles.cardActions}>
                        <Button type="link" icon={<EyeOutlined />} onClick={() => setViewVideoDetails(video)} />
                        <Button type="link" icon={<EditOutlined />} onClick={() => setEditingVideo(video)} />
                        <Button type="link" icon={<DeleteOutlined />} onClick={() => deleteVideo(video.id)} />
                        <Button type="link" icon={<MailOutlined />} onClick={() => showMailModal(video)} />
                    </div>
                </Card>
            ))}
        </div>
    );

    const filteredVideos = videos.filter((video) => {
        const matchesSearchText = video.channel.toLowerCase().includes(searchText.toLowerCase());
        const matchesPaymentFilter = paymentFilter ? video.payment === paymentFilter : true;
        const matchesStatusFilter = statusFilter ? video.status === statusFilter : true;
        const matchesTeamFilter = teamFilter ? video.ownerEmail === teamFilter : true;
        return matchesSearchText && matchesPaymentFilter && matchesStatusFilter && matchesTeamFilter;
    }).sort((a, b) => {
        if (dateSortOrder === 'ascend') {
            return new Date(a.date) - new Date(b.date);
        }
        if (dateSortOrder === 'descend') {
            return new Date(b.date) - new Date(a.date);
        }
        return 0;
    });

    return (
        <div style={styles.container}>
            <h2>Admin Video List</h2>
            <Button
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                size="large"
                style={styles.addButton}
                onClick={() => setIsAddModalVisible(true)}
            />
            {isMobile ? (
                <>
                    <Button
                        type="primary"
                        icon={<FilterOutlined />}
                        style={styles.filterButton}
                        onClick={() => setFiltersVisible(!filtersVisible)}
                    >
                        Filters
                    </Button>
                    {filtersVisible && (
                        <div style={styles.filtersContainer}>
                            <Input
                                placeholder="Search Channel/Profile"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={styles.searchInput}
                            />
                            <Select
                                placeholder="Sort by Date"
                                onChange={handleSortChange}
                                value={dateSortOrder}
                                style={styles.filterSelect}
                            >
                                <Option value="ascend">Ascending</Option>
                                <Option value="descend">Descending</Option>
                            </Select>
                            <Select
                                placeholder="Filter by Payment"
                                onChange={handlePaymentFilterChange}
                                value={paymentFilter}
                                style={styles.filterSelect}
                            >
                                <Option value="">All</Option>
                                <Option value="pending">Pending</Option>
                                <Option value="done">Done</Option>
                                <Option value="rejected">Rejected</Option>
                            </Select>
                            <Select
                                placeholder="Filter by Status"
                                onChange={handleStatusFilterChange}
                                value={statusFilter}
                                style={styles.filterSelect}
                            >
                                <Option value="">All</Option>
                                <Option value="pending">Pending</Option>
                                <Option value="live">Live</Option>
                                <Option value="cancel">Cancel</Option>
                            </Select>
                            <Select
                                placeholder="Filter by Team"
                                onChange={handleTeamFilterChange}
                                value={teamFilter}
                                style={styles.filterSelect}
                            >
                                <Option value="">All</Option>
                                {videos.map((video) => (
                                    <Option key={video.ownerEmail} value={video.ownerEmail}>
                                        {video.ownerEmail}
                                    </Option>
                                ))}
                            </Select>
                            <Button
                                type="default"
                                onClick={resetAllFilters}
                                style={styles.resetButton}
                            >
                                Reset All Filters
                            </Button>
                        </div>
                    )}
                    {renderMobileCards()}
                </>
            ) : (
                <Table
                    dataSource={filteredVideos}
                    columns={fullColumns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1500, y: 600 }}
                    onChange={(pagination, filters, sorter) => {
                        setDateSortOrder(sorter.order);
                        setPaymentFilter(filters.payment ? filters.payment[0] : '');
                        setStatusFilter(filters.status ? filters.status[0] : '');
                        setTeamFilter(filters.ownerEmail ? filters.ownerEmail[0] : '');
                    }}
                />
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
                        <Typography><strong>Added By:</strong> {viewVideoDetails.ownerEmail}</Typography>
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
    filterButton: {
        marginBottom: '16px',
    },
    filtersContainer: {
        marginBottom: '16px',
    },
    filterSelect: {
        width: '100%',
        marginBottom: '8px',
    },
    searchInput: {
        marginBottom: '8px',
    },
    resetButton: {
        width: '100%',
    },
    mailTemplateContainer: {
        maxHeight: '400px',
        overflowY: 'auto',
    },
    mailTemplate: {
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
    },
    videoDetailsContainer: {
        maxHeight: '400px',
        overflowY: 'auto',
    },
};

export default AdminVideoList;
