import React from 'react';
import { Form, Input, Button, Select, DatePicker, message } from 'antd';
import { db, auth } from '../firebase';
import moment from 'moment';
import { useAuth } from '../contexts/AuthContext';

const { Option } = Select;

const AddVideoForm = ({ onClose }) => {
    const [form] = Form.useForm();
    const { user } = useAuth();

    const handleFinish = async (values) => {
        if (!user) {
            message.error('You must be logged in to add a video.');
            return;
        }

        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists && userDoc.data().suspended) {
                message.error('Your account is suspended. You cannot add videos.');
                return;
            }

            await db.collection('videos').add({
                ...values,
                date: values.date.format('YYYY-MM-DD'),
                ownerUid: user.uid,
                ownerEmail: user.email,
                payment:'pending',
                
            });
            form.resetFields();
            message.success('Video added successfully!');
            onClose(); // Close the modal after successful submission
        } catch (error) {
            message.error('Failed to add video. Please check your permissions.');
        }
    };

    return (
        <Form form={form} onFinish={handleFinish} layout="vertical">
            <Form.Item name="channel" label="Channel/Profile" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="videoLink" label="Video Link" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select>
                    <Option value="pending">Pending</Option>
                    <Option value="live">Live</Option>
                    <Option value="cancel">Cancel</Option>
                </Select>
            </Form.Item>
            <Form.Item name="price" label="Creators Price" rules={[{ required: true }]}>
                <Input type="number" />
            </Form.Item>
            <Form.Item name="remarks" label="Brand Price">
                <Input />
            </Form.Item>
            <Form.Item name="brand" label="Brand" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="platform" label="Platform" rules={[{ required: true }]}>
                <Select>
                    <Option value="youtube">YouTube</Option>
                    <Option value="instagram">Instagram</Option>
                    <Option value="other">Other</Option>
                </Select>
            </Form.Item>
            <Form.Item name="contactInfo" label="Contact Info" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <DatePicker format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">Add Video</Button>
            </Form.Item>
        </Form>
    );
};

export default AddVideoForm;
