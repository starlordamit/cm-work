import React, { useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, message } from 'antd';
import moment from 'moment';
import { db } from '../firebase';

const { Option } = Select;

const EditVideoForm = ({ video, onClose }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({
            ...video,
            date: video.date ? moment(video.date, 'YYYY-MM-DD') : null,
        });
    }, [video, form]);

    const handleFinish = async (values) => {
        try {
            await db.collection('videos').doc(video.id).update({
                ...values,
                date: values.date.format('YYYY-MM-DD')
            });
            message.success('Video updated successfully');
            onClose();
        } catch (error) {
            message.error('Error updating video:', error.message);
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
            <Form.Item name="price" label="Price" rules={[{ required: true }]}>
                <Input type="number" />
            </Form.Item>
            <Form.Item name="remarks" label="Remarks">
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
                <Button type="primary" htmlType="submit">Save Changes</Button>
            </Form.Item>
        </Form>
    );
};

export default EditVideoForm;
