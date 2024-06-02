import React, { useState } from 'react';
import { db } from '../firebase';

const AddVideo = () => {
    const [title, setTitle] = useState('');
    const [creator, setCreator] = useState('');

    const handleAddVideo = async (e) => {
        e.preventDefault();
        try {
            await db.collection('videos').add({
                title,
                creator,
                status: 'pending',
            });
            setTitle('');
            setCreator('');
        } catch (error) {
            console.error('Error adding video:', error);
        }
    };

    return (
        <div>
            <h2>Add Video</h2>
            <form onSubmit={handleAddVideo}>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                <input type="text" value={creator} onChange={(e) => setCreator(e.target.value)} placeholder="Creator" />
                <button type="submit">Add Video</button>
            </form>
        </div>
    );
};

export default AddVideo;
