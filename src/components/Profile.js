import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Spin, Card } from 'antd';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const { user, loading: authLoading } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [initialValues, setInitialValues] = useState({
        email: '',
        name: '',
        phone: ''
    });

    useEffect(() => {
        if (user) {
            const fetchUserDetails = async () => {
                try {
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        setInitialValues({
                            email: user.email,
                            name: userData.name || '',
                            phone: userData.phone || ''
                        });
                    }
                } catch (error) {
                    message.error('Failed to fetch user details');
                } finally {
                    setLoading(false);
                }
            };

            fetchUserDetails();
        }
    }, [user]);

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            await db.collection('users').doc(user.uid).update({
                name: values.name,
                phone: values.phone
            });
            message.success('Profile updated successfully');
        } catch (error) {
            message.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return <Spin tip="Loading..." />;
    }

    return (
        <div style={styles.container}>
            <Card title="Profile" style={styles.card}>
                <Form
                    form={form}
                    initialValues={initialValues}
                    onFinish={handleFinish}
                    layout="vertical"
                >
                    <Form.Item label="Email" name="email">
                        <Input value={initialValues.email} disabled />
                    </Form.Item>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter your name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Phone" name="phone">
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Update Profile
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5',
        padding: '0 20px',
    },
    card: {
        width: '100%',
        maxWidth: '400px',
    },
};

export default Profile;
